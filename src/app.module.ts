import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedAuthModule } from './common/modules/auth.module';
import { S3Service } from './common';
import { BrandModule } from './modules/brand/brand.module';
import { CartModule } from './modules/cart/cart.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { OrderModule } from './modules/order/order.module';
import { RealTimeModule } from './modules/gateway/gateway.module';
// import { CacheModule } from '@nestjs/cache-manager';
import {GraphQLModule} from '@nestjs/graphql'
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['config/.env.development', '.env'],
      isGlobal: true,
    }),
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,                  
  autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
  sortSchema: true,
  playground: true,
  context: ({ req }) => ({ req }),
}),

//     CacheModule.register({
//       ttl:5000,
// isGlobal: true,
//     }),
    MongooseModule.forRoot(process.env.DB_URI!, {
      serverSelectionTimeoutMS: 30000,
    }),
    SharedAuthModule,
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    BrandModule,
    CartModule,
    CouponModule,
    OrderModule,
    RealTimeModule
  ],
  controllers: [AppController],
  providers: [AppService , S3Service],
})
export class AppModule {}
