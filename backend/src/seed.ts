import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedPermissionsService } from './database/seeds/seed-permissions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const seedService = app.get(SeedPermissionsService);

  try {
    await seedService.seed();
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

bootstrap();
