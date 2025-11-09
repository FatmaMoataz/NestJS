import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setDefaultLang } from './common';
import { LoggingInterceptor } from './common/interceptors';
import * as express from 'express'
import path from 'node:path';

async function bootstrap() {
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  app.use('/uploads' , express.static(path.resolve('./uploads')))
  app.use(setDefaultLang)
  app.useGlobalInterceptors(new LoggingInterceptor)
  await app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
bootstrap();
