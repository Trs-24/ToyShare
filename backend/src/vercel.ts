import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const expressApp = express();

let cachedApp: NestExpressApplication;

async function bootstrap(): Promise<NestExpressApplication> {
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  await app.init();

  cachedApp = app;
  return app;
}

export default async (req: any, res: any) => {
  try {
    await bootstrap();
    expressApp(req, res);
  } catch (error) {
    console.error('Error during Vercel bootstrap:', error);
    res.status(500).json({
      message: 'Internal Server Error during bootstrap',
      error: error.message,
      stack: error.stack,
    });
  }
};
