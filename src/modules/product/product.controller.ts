import { Controller, Get, Param, Delete, UseInterceptors, Post, Body, UploadedFiles, ParseFilePipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import { Auth, User } from 'src/common/decorators';
import { endPoint } from './authorization';
import { type UserDocument } from 'src/DB';
import { IResponse, successResponse } from 'src/common';

@UsePipes(new ValidationPipe({ whitelist: true , forbidNonWhitelisted: true }))
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseInterceptors(FilesInterceptor("attachments" , 5 , cloudFileUpload({validation: fileValidation.image})))
  @Auth(endPoint.create)
  @Post()
  async create(
    @UploadedFiles(ParseFilePipe) files: Express.Multer.File[],
    @User() user: UserDocument,
    @Body() createProductDto: CreateProductDto):Promise<IResponse> {
    const product = await this.productService.create(createProductDto , files , user);
    return successResponse({status: 201 , data: {product}});
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
  //   return this.productService.update(+id, updateProductDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
