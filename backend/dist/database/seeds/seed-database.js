"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
async function seed() {
    const dataSource = new typeorm_1.DataSource({
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
            await dataSource.query(`INSERT INTO permissions (module, action, description, created_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (module, action) DO NOTHING`, [perm.module, perm.action, perm.description]);
        }
        console.log('✅ Permisos creados');
        console.log('📝 Creando roles...');
        const adminRoleResult = await dataSource.query(`INSERT INTO roles (name, description, is_system, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`, ['Administrador', 'Acceso total al sistema', true]);
        const adminRole = adminRoleResult[0];
        await dataSource.query(`INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, id FROM permissions
       ON CONFLICT DO NOTHING`, [adminRole.id]);
        const gerenteRoleResult = await dataSource.query(`INSERT INTO roles (name, description, is_system, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`, ['Gerente', 'Gestión completa de sucursal', true]);
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
            await dataSource.query(`INSERT INTO role_permissions (role_id, permission_id)
         SELECT $1, id FROM permissions WHERE module = $2 AND action = $3
         ON CONFLICT DO NOTHING`, [gerenteRole.id, module, action]);
        }
        const cajeroRoleResult = await dataSource.query(`INSERT INTO roles (name, description, is_system, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`, ['Cajero', 'Operación de punto de venta', true]);
        const cajeroRole = cajeroRoleResult[0];
        const cajeroPerms = [
            'sales:create',
            'sales:read',
            'products:read',
            'inventory:read',
        ];
        for (const perm of cajeroPerms) {
            const [module, action] = perm.split(':');
            await dataSource.query(`INSERT INTO role_permissions (role_id, permission_id)
         SELECT $1, id FROM permissions WHERE module = $2 AND action = $3
         ON CONFLICT DO NOTHING`, [cajeroRole.id, module, action]);
        }
        const almacenistaRoleResult = await dataSource.query(`INSERT INTO roles (name, description, is_system, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`, ['Almacenista', 'Gestión de inventario y recepción', true]);
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
            await dataSource.query(`INSERT INTO role_permissions (role_id, permission_id)
         SELECT $1, id FROM permissions WHERE module = $2 AND action = $3
         ON CONFLICT DO NOTHING`, [almacenistaRole.id, module, action]);
        }
        console.log('✅ Roles creados');
        const passwordHash = await bcrypt.hash('Admin123!', 12);
        const adminUserResult = await dataSource.query(`INSERT INTO users (
        username, email, password_hash, first_name, last_name,
        is_active, created_at, updated_at
      )
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
       RETURNING id`, ['admin', 'admin@carniceria.com', passwordHash, 'Admin', 'Sistema', true]);
        const adminUser = adminUserResult[0];
        await dataSource.query(`INSERT INTO user_roles (user_id, role_id, company_id, branch_id)
       VALUES ($1, $2, NULL, NULL)
       ON CONFLICT DO NOTHING`, [adminUser.id, adminRole.id]);
        console.log('✅ Usuario administrador creado');
    }
    finally {
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
//# sourceMappingURL=seed-database.js.map