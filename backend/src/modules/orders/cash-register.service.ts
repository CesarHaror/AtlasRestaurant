import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, IsNull } from 'typeorm';
import { CashRegister } from './entities/cash-register.entity';
import { CashRegisterSession } from './entities/cash-register-session.entity';
import { Order } from './entities/order.entity';
import { OrderPayment } from './entities/order-payment.entity';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { UpdateCashRegisterDto } from './dto/update-cash-register.dto';
import { OpenSessionDto } from './dto/open-session.dto';
import { CloseSessionDto } from './dto/close-session.dto';
import { Branch } from '../branches/entities/branch.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CashRegisterService {
  private readonly logger = new Logger(CashRegisterService.name);

  constructor(
    @InjectRepository(CashRegister)
    private cashRegisterRepository: Repository<CashRegister>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectRepository(CashRegisterSession)
    private sessionRepository: Repository<CashRegisterSession>,
    @InjectRepository(Order)
    private saleRepository: Repository<Order>,
    @InjectRepository(OrderPayment)
    private paymentRepository: Repository<OrderPayment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * Crear caja registradora
   */
  async createCashRegister(
    dto: CreateCashRegisterDto,
    companyId: number,
  ): Promise<CashRegister> {
    // Verificar sucursal
    const branch = await this.branchRepository.findOne({ where: { id: dto.branchId } });
    if (!branch) {
      throw new BadRequestException('Sucursal no encontrada');
    }
    if (branch.companyId !== companyId) {
      throw new BadRequestException('La sucursal no pertenece a la empresa');
    }

    // Verificar que el código no exista dentro de la empresa
    const companyBranches = await this.branchRepository.find({ where: { companyId } });
    const branchIds = companyBranches.map((b) => b.id);
    const existing = await this.cashRegisterRepository
      .createQueryBuilder('cr')
      .where('cr.code = :code', { code: dto.code })
      .andWhere('cr.branchId IN (:...branchIds)', { branchIds })
      .getOne();

    if (existing) {
      throw new ConflictException(
        `Ya existe una caja con el código ${dto.code} en esta empresa`,
      );
    }

    const cashRegister = this.cashRegisterRepository.create(dto);

    const saved = await this.cashRegisterRepository.save(cashRegister);
    this.logger.log(`Caja ${saved.code} creada exitosamente`);

    return saved;
  }

  /**
   * Listar cajas registradoras
   */
  async findAll(branchId?: number): Promise<CashRegister[]> {
    const query = this.cashRegisterRepository.createQueryBuilder('cr')
      .select('cr.id', 'id')
      .addSelect('cr.code', 'code')
      .addSelect('cr.name', 'name')
      .addSelect('cr.deviceIdentifier', 'deviceIdentifier')
      .addSelect('cr.hasScale', 'hasScale')
      .addSelect('cr.scalePort', 'scalePort')
      .addSelect('cr.isActive', 'isActive')
      .addSelect('cr.branchId', 'branchId')
      .addSelect('b.name', 'branchName')
      .leftJoin('branches', 'b', 'b.id = cr.branch_id')
      .addSelect('cr.createdAt', 'createdAt')
      .addSelect('cr.updatedAt', 'updatedAt')
      .where('cr.isActive = :isActive', { isActive: true })
      .orderBy('cr.code', 'ASC');

    if (branchId) {
      query.andWhere('cr.branchId = :branchId', { branchId });
    }

    return query.getRawMany() as any;
  }

  /**
   * Obtener una caja por ID
   */
  async findOne(id: string): Promise<CashRegister> {
    const cashRegister = await this.cashRegisterRepository.findOne({
      where: { id },
    });

    if (!cashRegister) {
      throw new NotFoundException(`Caja ${id} no encontrada`);
    }

    return cashRegister;
  }

  /**
   * Actualizar caja registradora
   */
  async update(
    id: string,
    dto: UpdateCashRegisterDto,
  ): Promise<CashRegister> {
    const cashRegister = await this.findOne(id);

    // Si se cambia el código, verificar que no exista
    if (dto.code && dto.code !== cashRegister.code) {
      // Obtener empresa de la sucursal actual de la caja
      const branch = await this.branchRepository.findOne({ where: { id: cashRegister.branchId! } });
      if (!branch) {
        throw new BadRequestException('Sucursal de la caja no encontrada');
      }
      const companyBranches = await this.branchRepository.find({ where: { companyId: branch.companyId } });
      const branchIds = companyBranches.map((b) => b.id);
      const existing = await this.cashRegisterRepository
        .createQueryBuilder('cr')
        .where('cr.code = :code', { code: dto.code })
        .andWhere('cr.branchId IN (:...branchIds)', { branchIds })
        .andWhere('cr.id != :id', { id })
        .getOne();

      if (existing) {
        throw new ConflictException(
          `Ya existe una caja con el código ${dto.code} en esta empresa`,
        );
      }
    }

    Object.assign(cashRegister, dto);
    return this.cashRegisterRepository.save(cashRegister);
  }

  /**
   * Desactivar caja registradora
   */
  async deactivate(id: string): Promise<CashRegister> {
    const cashRegister = await this.findOne(id);

    // Verificar que no tenga sesión abierta
    const activeSession = await this.sessionRepository.findOne({
      where: { cashRegister: { id }, status: 'OPEN' },
    });

    if (activeSession) {
      throw new BadRequestException(
        'No se puede desactivar una caja con sesión abierta',
      );
    }

    cashRegister.isActive = false;
    return this.cashRegisterRepository.save(cashRegister);
  }

  /**
   * 🔓 Abrir sesión de caja
   */
  async openSession(
    dto: OpenSessionDto,
    userId: string,
  ): Promise<CashRegisterSession> {
    return (await this.dataSource.transaction(async (manager) => {
      // 1. Verificar que la caja existe y está activa
      const cashRegister = await manager.findOne(CashRegister, {
        where: { id: dto.cashRegisterId },
      });

      if (!cashRegister) {
        throw new NotFoundException('Caja registradora no encontrada');
      }

      if (!cashRegister.isActive) {
        throw new BadRequestException('La caja está inactiva');
      }

      // 2. Buscar usuario
      const user = await manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // 3. Verificar que NO haya sesión abierta en esta caja
      const existingSession = await manager.findOne(CashRegisterSession, {
        where: { cashRegister: { id: dto.cashRegisterId }, status: 'OPEN' },
        relations: ['user'],
      });

      if (existingSession) {
        throw new ConflictException(
          `Ya existe una sesión abierta en esta caja (abierta por ${existingSession.user?.username || 'usuario'} a las ${existingSession.openedAt.toISOString()})`,
        );
      }

      // 4. Crear sesión
      const session = new CashRegisterSession();
      session.cashRegister = cashRegister;
      session.user = user;
      session.openedAt = new Date();
      session.openingCash = dto.openingCash.toFixed(2);
      session.expectedCash = '0.00';
      session.cashDifference = '0.00';
      session.cardTotal = '0.00';
      session.transferTotal = '0.00';
      session.totalOrders = '0.00';
      session.status = 'OPEN';
      session.notes = dto.notes;

      const savedSession = await manager.save(CashRegisterSession, session);

      this.logger.log(
        `Sesión ${savedSession.id} abierta en caja ${cashRegister.code} por usuario ${userId}`,
      );

      // Retornar con relaciones
      return await manager.findOne(CashRegisterSession, {
        where: { id: savedSession.id },
        relations: ['cashRegister', 'user'],
      });
    }))!;
  }

  /**
   * 🔒 Cerrar sesión con arqueo
   */
  async closeSession(
    sessionId: string,
    dto: CloseSessionDto,
    userId: string,
  ): Promise<CashRegisterSession> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Obtener sesión
      const session = await manager.findOne(CashRegisterSession, {
        where: { id: sessionId },
        relations: ['cashRegister', 'user'],
      });

      if (!session) {
        throw new NotFoundException('Sesión no encontrada');
      }

      // 2. Validar que esté abierta
      if (session.status !== 'OPEN') {
        throw new BadRequestException('La sesión ya está cerrada');
      }

      // 3. Calcular ventas en efectivo
      const cashOrdersResult = await manager
        .createQueryBuilder(OrderPayment, 'payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.sale_id IN (SELECT id FROM sales WHERE session_id = :sessionId)', {
          sessionId,
        })
        .andWhere('payment.payment_method = :method', { method: 'CASH' })
        .getRawOne();

      const cashOrders = Number(cashOrdersResult?.total || 0);

      // 4. Calcular efectivo esperado
      const expectedCash = Number(session.openingCash) + cashOrders;

      // 5. Calcular diferencia
      const actualCash = dto.actualCash;
      const cashDifference = actualCash - expectedCash;

      // 6. Actualizar sesión
      session.closedAt = new Date();
      session.closedBy = userId;
      session.expectedCash = expectedCash.toFixed(2);
      session.actualCash = actualCash.toFixed(2);
      session.cashDifference = cashDifference.toFixed(2);
      session.status = 'CLOSED';

      // Agregar notas de cierre
      if (dto.notes) {
        session.notes = session.notes
          ? `${session.notes}\n[CIERRE] ${dto.notes}`
          : dto.notes;
      }

      // Agregar alerta si hay diferencia significativa
      if (Math.abs(cashDifference) > 50) {
        const alertNote = `\n⚠️ ALERTA: ${cashDifference > 0 ? 'SOBRANTE' : 'FALTANTE'} de $${Math.abs(cashDifference).toFixed(2)}`;
        session.notes = session.notes ? `${session.notes}${alertNote}` : alertNote.trim();
      }

      await manager.save(CashRegisterSession, session);

      this.logger.log(
        `Sesión ${sessionId} cerrada. Diferencia: ${cashDifference.toFixed(2)}`,
      );

      return session;
    });
  }

  /**
   * Obtener sesión activa de una caja
   */
  async getActiveSession(cashRegisterId: string): Promise<CashRegisterSession | null> {
    return this.sessionRepository.findOne({
      where: { cashRegister: { id: cashRegisterId }, status: 'OPEN' },
      relations: ['cashRegister', 'user'],
    });
  }

  /**
   * Obtener mi sesión activa (del usuario actual)
   */
  async getMyActiveSession(userId: string): Promise<CashRegisterSession | null> {
    return this.sessionRepository.findOne({
      where: { user: { id: userId }, status: 'OPEN' },
    });
  }

  /**
   * Listar sesiones con filtros
   */
  async findAllSessions(
    page = 1,
    limit = 20,
    status?: string,
    cashRegisterId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (cashRegisterId) {
      where.cashRegisterId = cashRegisterId;
    }

    if (startDate && endDate) {
      where.openedAt = Between(new Date(startDate), new Date(endDate));
    }

    const [data, total] = await this.sessionRepository.findAndCount({
      where,
      relations: ['cashRegister', 'user'],
      skip,
      take: limit,
      order: { openedAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener una sesión por ID
   */
  async findSession(sessionId: string): Promise<CashRegisterSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['cashRegister', 'user'],
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    return session;
  }

  /**
   * 📊 Reporte detallado de sesión
   */
  async getSessionReport(sessionId: string) {
    const session = await this.findSession(sessionId);

    // Obtener ventas de la sesión
    const sales = await this.saleRepository.find({
      where: { sessionId },
      relations: ['items', 'payments'],
    });

    // Calcular ventas en efectivo
    const cashOrders = sales.reduce((sum, sale) => {
      const cashPayments = sale.payments
        .filter((p) => p.paymentMethod === 'CASH')
        .reduce((s, p) => s + Number(p.amount), 0);
      return sum + cashPayments;
    }, 0);

    // Desglose de pagos por método
    const paymentBreakdown: any = {};
    sales.forEach((sale) => {
      sale.payments.forEach((payment) => {
        const method = payment.paymentMethod;
        if (!paymentBreakdown[method]) {
          paymentBreakdown[method] = { count: 0, total: 0 };
        }
        paymentBreakdown[method].count++;
        paymentBreakdown[method].total += Number(payment.amount);
      });
    });

    // Convertir a array
    const paymentBreakdownArray = Object.entries(paymentBreakdown).map(
      ([method, data]: [string, any]) => ({
        method,
        count: data.count,
        total: data.total,
      }),
    );

    // Calcular promedio de ticket
    const averageTicket =
      sales.length > 0 ? Number(session.totalOrders) / sales.length : 0;

    // Determinar tipo de diferencia
    const difference = Number(session.cashDifference || 0);
    let differenceType = 'CUADRA';
    if (difference > 0) differenceType = 'SOBRANTE';
    if (difference < 0) differenceType = 'FALTANTE';

    return {
      session: {
        id: session.id,
        cashRegister: {
          code: session.cashRegister?.code,
          name: session.cashRegister?.name,
        },
        user: {
          username: session.user?.username,
        },
        closedBy: session.closedBy,
        openedAt: session.openedAt,
        closedAt: session.closedAt,
        status: session.status,
        notes: session.notes,
      },
      cash: {
        openingCash: Number(session.openingCash),
        cashOrders: cashOrders,
        expectedCash: Number(session.expectedCash || 0),
        actualCash: Number(session.actualCash || 0),
        difference: difference,
        differenceType,
      },
      sales: {
        totalTransactions: sales.length,
        totalAmount: Number(session.totalOrders),
        averageTicket: averageTicket,
      },
      payments: {
        cash: cashOrders,
        card: Number(session.cardTotal),
        transfer: Number(session.transferTotal),
        credit: 0, // TODO: calcular créditos cuando se implemente
        breakdown: paymentBreakdownArray,
      },
    };
  }
}
