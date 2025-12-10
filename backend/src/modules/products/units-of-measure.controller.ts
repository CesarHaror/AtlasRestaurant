import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UnitOfMeasure } from './entities/unit-of-measure.entity';

@ApiTags('units-of-measure')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('units-of-measure')
export class UnitsOfMeasureController {
  constructor(
    @InjectRepository(UnitOfMeasure)
    private readonly unitRepo: Repository<UnitOfMeasure>,
  ) {}

  @Get()
  async findAll() {
    return this.unitRepo.find({
      order: { name: 'ASC' },
    });
  }
}
