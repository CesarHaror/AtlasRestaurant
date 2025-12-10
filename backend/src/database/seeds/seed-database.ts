/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Script para crear datos iniciales en la base de datos
 * Ejecutar con: npm run seed
 */

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'erp_carniceria',
    entities: ['src/**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('✅ Conectado a la base de datos');

  try {
    // 1. Crear permisos
    const permissions = [
      { module: 'sales', action: 'create', description: 'Crear ventas' },
      { module: 'sales', action: 'read', description: 'Ver ventas' },
      { module: 'sales', action: 'cancel', description: 'Cancelar ventas' },
      { module: 'sales', action: 'refund', description: 'Hacer devoluciones' },
      { module: 'inventory', action: 'read', description: 'Ver inventario' },
      {
        module: 'inventory',
        action: 'adjust',
        description: 'Ajustar inventario',
      },
      {
        module: 'inventory',
        action: 'transfer',
        description: 'Crear traslados',
      },
      {
        module: 'purchases',
        action: 'create',
        description: 'Crear órdenes de compra',
      },
      { module: 'purchases', action: 'read', description: 'Ver compras' },
      {
        module: 'purchases',
        action: 'approve',
        description: 'Aprobar compras',
      },
      {
        module: 'purchases',
        action: 'receive',
        description: 'Recibir mercancía',
      },
      { module: 'products', action: 'create', description: 'Crear productos' },
      { module: 'products', action: 'read', description: 'Ver productos' },
      {
        module: 'products',
        action: 'update',
        description: 'Modificar productos',
      },
      {
        module: 'products',
        action: 'delete',
        description: 'Eliminar productos',
      },
      {
        module: 'reports',
        action: 'sales',
        description: 'Ver reportes de ventas',
      },
      {
        module: 'reports',
        action: 'inventory',
        description: 'Ver reportes de inventario',
      },
      {
        module: 'reports',
        action: 'profitability',
        description: 'Ver reportes de utilidades',
      },
      { module: 'users', action: 'create', description: 'Crear usuarios' },
      { module: 'users', action: 'read', description: 'Ver usuarios' },
      { module: 'users', action: 'update', description: 'Modificar usuarios' },
      { module: 'users', action: 'delete', description: 'Eliminar usuarios' },
      { module: 'settings', action: 'read', description: 'Ver configuración' },
      {
        module: 'settings',
        action: 'update',
        description: 'Modificar configuración',
      },
    ];

    console.log('📝 Creando permisos...');
    for (const perm of permissions) {
      const name = `${perm.module}:${perm.action}`;
      await dataSource.query(
        `INSERT INTO permissions (name, module, action, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (module, action) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW()`,
        [name, perm.module, perm.action, perm.description],
      );
    }
    console.log('✅ Permisos creados');

    // 2. Crear roles
    console.log('📝 Creando roles...');

    const adminRoleResult = await dataSource.query(
      `INSERT INTO roles (name, description, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW()
       RETURNING id`,
      ['Administrador', 'Acceso total al sistema'],
    );
    const adminRole = adminRoleResult[0];

    await dataSource.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, id FROM permissions
       ON CONFLICT DO NOTHING`,
      [adminRole.id],
    );

    const gerenteRoleResult = await dataSource.query(
      `INSERT INTO roles (name, description, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW()
       RETURNING id`,
      ['Gerente', 'Gestión completa de sucursal'],
    );
    const gerenteRole = gerenteRoleResult[0];

    const gerentePerms = [
      'sales:create',
      'sales:read',
      'sales:cancel',
      'inventory:read',
      'inventory:adjust',
      'inventory:transfer',
      'purchases:create',
      'purchases:read',
      'purchases:approve',
      'purchases:receive',
      'products:create',
      'products:read',
      'products:update',
      'reports:sales',
      'reports:inventory',
      'reports:profitability',
      'users:read',
    ];

    for (const perm of gerentePerms) {
      const [module, action] = perm.split(':');
      await dataSource.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT $1, id FROM permissions WHERE module = $2 AND action = $3
         ON CONFLICT DO NOTHING`,
        [gerenteRole.id, module, action],
      );
    }

    const cajeroRoleResult = await dataSource.query(
      `INSERT INTO roles (name, description, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW()
       RETURNING id`,
      ['Cajero', 'Operación de punto de venta'],
    );
    const cajeroRole = cajeroRoleResult[0];

    const cajeroPerms = [
      'sales:create',
      'sales:read',
      'products:read',
      'inventory:read',
    ];
    for (const perm of cajeroPerms) {
      const [module, action] = perm.split(':');
      await dataSource.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT $1, id FROM permissions WHERE module = $2 AND action = $3
         ON CONFLICT DO NOTHING`,
        [cajeroRole.id, module, action],
      );
    }

    const almacenistaRoleResult = await dataSource.query(
      `INSERT INTO roles (name, description, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW()
       RETURNING id`,
      ['Almacenista', 'Gestión de inventario y recepción'],
    );
    const almacenistaRole = almacenistaRoleResult[0];

    const almacenistaPerms = [
      'inventory:read',
      'inventory:adjust',
      'inventory:transfer',
      'purchases:read',
      'purchases:receive',
      'products:read',
    ];
    for (const perm of almacenistaPerms) {
      const [module, action] = perm.split(':');
      await dataSource.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT $1, id FROM permissions WHERE module = $2 AND action = $3
         ON CONFLICT DO NOTHING`,
        [almacenistaRole.id, module, action],
      );
    }

    console.log('✅ Roles creados');

    // 3. Crear usuario administrador por defecto (password desde env o placeholder)
    const adminPlain = process.env.ADMIN_SEED_PASSWORD || 'ChangeMeAdmin!123';
    const passwordHash = await bcrypt.hash(adminPlain, 12);

    const adminUserResult = await dataSource.query(
      `INSERT INTO users (
        email, password, username, first_name, last_name,
        is_active, created_at, updated_at
      )
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
       RETURNING id`,
      ['admin@carniceria.com', passwordHash, 'admin', 'Admin', 'Sistema', true],
    );
    const adminUser = adminUserResult[0];

    await dataSource.query(
      `INSERT INTO users_roles (user_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [adminUser.id, adminRole.id],
    );

    console.log('✅ Usuario administrador creado');
    console.log('⚠️  Password temporal admin (cámbiala inmediatamente):', adminPlain);

    // 4. Tomar compañía existente (si no hay, omitir productos demo)
    console.log('🏢 Buscando compañía existente...');
    const existingCompany = await dataSource.query(
      `SELECT id FROM companies ORDER BY id ASC LIMIT 1`
    );
    const company = existingCompany[0];

    // 5. Crear caja registradora demo
    console.log('🧾 Creando caja registradora demo...');
    const cashRegisterResult = await dataSource.query(
      `INSERT INTO cash_registers (code, name, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, code`,
      ['CR-001', 'Caja Principal', true],
    );
    const cashRegister = cashRegisterResult[0];

    // 6. Abrir sesión de caja demo
    console.log('🔓 Abriendo sesión de caja demo...');
    const sessionResult = await dataSource.query(
      `INSERT INTO cash_register_sessions (
          cash_register_id, user_id, opened_at, opening_cash, expected_cash,
          cash_difference, card_total, transfer_total, total_sales, status, notes, created_at
        )
       VALUES ($1, $2, NOW(), $3, '0.00', '0.00', '0.00', '0.00', '0.00', 'OPEN', $4, NOW())
       RETURNING id`,
      [cashRegister.id, adminUser.id, '500.00', 'Sesión demo'],
    );
    const session = sessionResult[0];

    // 7. Productos de demo (si no existen, crear algunos simples)
    console.log('🥩 Creando productos demo si no existen...');
    if (company) {
      const productA = (await dataSource.query(
      `INSERT INTO products (company_id, sku, barcode, name, price, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
       ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, updated_at = NOW()
       RETURNING id`,
      [company.id, 'SKU-STEAK', 'BAR-0001', 'Bistec de res', '150.00'],
      ))[0];
      const productB = (await dataSource.query(
      `INSERT INTO products (company_id, sku, barcode, name, price, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
       ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, updated_at = NOW()
       RETURNING id`,
      [company.id, 'SKU-CHOPS', 'BAR-0002', 'Chuleta de cerdo', '95.00'],
      ))[0];

    // 8. Ventas demo con métodos de pago variados
    console.log('🧾 Creando ventas demo...');
    // 8. Ventas demo con métodos de pago variados
    const sale1 = (await dataSource.query(
      `INSERT INTO sales (
        sale_number, session_id, cash_register_id, sale_date, subtotal, tax_amount, discount_amount,
        total_amount, sale_type, status, cashier_id, created_at
      ) VALUES ($1, $2, $3, NOW(), '150.00', '0.00', '0.00', '150.00', 'RETAIL', 'COMPLETED', $4, NOW())
      RETURNING id`,
      ['S-000001', session.id, cashRegister.id, adminUser.id],
    ))[0];
    if (company && productA) {
      await dataSource.query(
      `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal, tax_rate, tax_amount, discount_percentage, discount_amount, total_amount)
       VALUES ($1, $2, '1.000', '150.00', '150.00', '0.00', '0.00', '0.00', '0.00', '150.00')`,
      [sale1.id, productA.id],
      );
    }
    await dataSource.query(
      `INSERT INTO sale_payments (sale_id, payment_method, amount, payment_date)
       VALUES ($1, 'CASH', '150.00', NOW())`,
      [sale1.id],
    );

    const sale2 = (await dataSource.query(
      `INSERT INTO sales (
        sale_number, session_id, cash_register_id, sale_date, subtotal, tax_amount, discount_amount,
        total_amount, sale_type, status, cashier_id, created_at
      ) VALUES ($1, $2, $3, NOW(), '190.00', '0.00', '30.00', '160.00', 'RETAIL', 'COMPLETED', $4, NOW())
      RETURNING id`,
      ['S-000002', session.id, cashRegister.id, adminUser.id],
    ))[0];
    if (company && productB) {
      await dataSource.query(
      `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal, tax_rate, tax_amount, discount_percentage, discount_amount, total_amount)
       VALUES ($1, $2, '2.000', '95.00', '190.00', '0.00', '0.00', '15.79', '30.00', '160.00')`,
      [sale2.id, productB.id],
      );
    }
    await dataSource.query(
      `INSERT INTO sale_payments (sale_id, payment_method, amount, payment_date)
       VALUES ($1, 'CARD', '160.00', NOW())`,
      [sale2.id],
    );

    const sale3 = (await dataSource.query(
      `INSERT INTO sales (
        sale_number, session_id, cash_register_id, sale_date, subtotal, tax_amount, discount_amount,
        total_amount, sale_type, status, cashier_id, created_at
      ) VALUES ($1, $2, $3, NOW(), '89.90', '0.00', '0.00', '89.90', 'RETAIL', 'COMPLETED', $4, NOW())
      RETURNING id`,
      ['S-000003', session.id, cashRegister.id, adminUser.id],
    ))[0];
    if (company && productB) {
      await dataSource.query(
      `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal, tax_rate, tax_amount, discount_percentage, discount_amount, total_amount)
       VALUES ($1, $2, '1.000', '89.90', '89.90', '0.00', '0.00', '0.00', '0.00', '89.90')`,
      [sale3.id, productB.id],
      );
    }
    await dataSource.query(
      `INSERT INTO sale_payments (sale_id, payment_method, amount, payment_date)
       VALUES ($1, 'TRANSFER', '89.90', NOW())`,
      [sale3.id],
    );
    } else {
      console.log('ℹ️ No hay compañía; se crean ventas demo sin items, sólo pagos para sesión.');
    }

    console.log('✅ Datos demo POS creados: Caja CR-001, sesión abierta y 3 ventas');
  } finally {
    await dataSource.destroy();
  }
}

seed()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
