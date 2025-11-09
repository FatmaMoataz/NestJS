import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setDefaultLang } from './common';
import { LoggingInterceptor } from './common/interceptors';

async function bootstrap() {
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  app.use(setDefaultLang)
  app.useGlobalInterceptors(new LoggingInterceptor)
  await app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
bootstrap();
