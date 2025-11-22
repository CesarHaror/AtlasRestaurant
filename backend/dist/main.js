"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    app.enableCors({
        origin: configService.get('FRONTEND_URL'),
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('ERP Carnicerías API')
        .setDescription('API REST para sistema ERP de carnicerías')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Autenticación y autorización')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const portNumber = Number(configService.get('PORT') ?? 3000);
    await app.listen(portNumber);
    logger.log(`🚀 Aplicación corriendo en: http://localhost:${portNumber}`);
    logger.log(`📚 Documentación en: http://localhost:${portNumber}/api/docs`);
}
void bootstrap();
//# sourceMappingURL=main.js.map