import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Este script ha sido sanitizado para no contener credenciales reales.
// Usa variables de entorno. Ejemplo de ejecución:
//   DB_HOST=localhost DB_PORT=5432 DB_USERNAME=postgres DB_PASSWORD=... DB_DATABASE=erp_carniceria \
//   ADMIN_RESET_PASSWORD="AdminTemp123!" npx ts-node backend/scripts/reset-admin-password.ts

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGEME',
  database: process.env.DB_DATABASE || 'erp_carniceria',
});

async function resetAdminPassword() {
  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    const newPassword = process.env.ADMIN_RESET_PASSWORD || 'AdminTemp123!';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const result = await dataSource.query(
      `UPDATE users SET password = $1 WHERE username = $2 RETURNING id, username`,
      [hashedPassword, process.env.ADMIN_USERNAME || 'admin']
    );

    if (result.length > 0) {
      console.log('✅ Contraseña actualizada correctamente');
      console.log('📧 Usuario:', result[0].username);
      console.log('🔑 Nueva contraseña temporal (cámbiala inmediatamente):', newPassword);
    } else {
      console.log('❌ Usuario objetivo no encontrado');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

if (require.main === module) {
  resetAdminPassword();
}
