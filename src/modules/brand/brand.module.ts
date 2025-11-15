import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandModel, BrandRepository } from 'src/DB';
import { S3Service } from 'src/common';

@Module({
  controllers: [BrandController],
  providers: [BrandService, BrandRepository , S3Service],
  imports: [BrandModel],
})
export class BrandModule {}
