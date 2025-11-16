import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryModel, CategoryRepository } from 'src/DB';
import { S3Service } from 'src/common';

@Module({
  imports: [CategoryModel],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, S3Service],
  exports: [CategoryRepository, S3Service],
})
export class CategoryModule {}
