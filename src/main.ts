import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { setupOpenTelemetry } from './telemetry';

(async () => {
    await setupOpenTelemetry();
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        allowedHeaders: ['content-type'],
        origin: "*",
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe());

    const config = new DocumentBuilder()
        .setTitle('Token Search Backend')
        .setDescription('REST API Documentation')
        .setVersion('1.0.0')
        .addTag('TSB')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);

    await app.listen(
        process.env.APP_PORT || '3000',
        () => console.log(`server started on PORT ${process.env.APP_PORT}`)
    );
})();
