import {
  Controller,
  Get,
  Param,
  Delete,
  UseInterceptors,
  Post,
  Body,
  UploadedFiles,
  ParseFilePipe,
  UsePipes,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ProductParamsDto,
  UpdateProductAttachmentDto,
  UpdateProductDto,
} from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import { Auth, User } from 'src/common/decorators';
import { endPoint } from './authorization';
import { Product, type UserDocument } from 'src/DB';
import { IResponse, successResponse } from 'src/common';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      5,
      cloudFileUpload({ validation: fileValidation.image }),
    ),
  )
  @Auth(endPoint.create)
  @Post()
  async create(
    @UploadedFiles(ParseFilePipe) files: Express.Multer.File[],
    @User() user: UserDocument,
    @Body() createProductDto: CreateProductDto,
  ): Promise<IResponse> {
    const product = await this.productService.create(
      createProductDto,
      files,
      user,
    );
    return successResponse({ status: 201, data: { product } });
  }

  @Auth(endPoint.create)
  @Patch(':productId')
  async update(
    @Param() params: ProductParamsDto,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: UserDocument,
  ): Promise<IResponse>{
    const product = await this.productService.update(
      params.productId,
      updateProductDto,
      user,
    );
    return successResponse({ status: 200, data: { product } });
  }

  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      5,
      cloudFileUpload({ validation: fileValidation.image }),
    ),
  )
  @Auth(endPoint.create)
  @Patch(':productId/attachment')
  async updateAttachment(
    @Param() params: ProductParamsDto,
    @Body() updateProductAttachmentDto: UpdateProductAttachmentDto,
    @User() user: UserDocument,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: false }))
    files?: Express.Multer.File[],
  ):Promise<IResponse> {
    const product = await this.productService.updateAttachment(
      params.productId,
      {}, // empty UpdateProductDto
      user,
      updateProductAttachmentDto,
      files,
    );
    return successResponse({ status: 200, data: { product } });
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
