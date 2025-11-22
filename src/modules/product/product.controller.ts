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
  Query,
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
import { type UserDocument } from 'src/DB';
import { GetAllDto, GetAllResponse, IProduct, IResponse, RoleEnum, successResponse } from 'src/common';

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

  @Auth(endPoint.create)
  @Patch(':productId/restore')
  async restore(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    const product = await this.productService.freeze(params.productId, user);
    return successResponse({ data: { product } });
  }

  @Auth(endPoint.create)
  @Delete(':productId/freeze')
  async freeze(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.productService.freeze(params.productId, user);
    return successResponse({
      message: 'Product freezed successfully',
    });
  }

  @Auth(endPoint.create)
  @Delete(':productId')
  async remove(@Param() params: ProductParamsDto, @User() user: UserDocument) {
    await this.productService.remove(params.productId);
    return successResponse<string>({
      message: 'product removed successfully',
    });
  }

  @Get()
  async findAll(
    @Query() query: GetAllDto,
  ): Promise<IResponse<GetAllResponse<IProduct>>> {
    const result = await this.productService.findAll(query, false);
    return successResponse<GetAllResponse<IProduct>>({ data: { result } });
  }

  @Auth(endPoint.create)
  @Get('/archive')
  async findAllArchive(
    @Query() query: GetAllDto,
  ): Promise<IResponse<GetAllResponse<IProduct>>> {
    const result = await this.productService.findAll(query, true);
    return successResponse<GetAllResponse<IProduct>>({ data: { result } });
  }

  @Get(':productId')
  async findOne(@Param() params: ProductParamsDto) {
    const product = await this.productService.findOne(
      params.productId,
      false,
    );
    return successResponse({ data: { product } });
  }

  @Auth(endPoint.create)
  @Get(':productId/archive')
  async findOneArchive(@Param() params: ProductParamsDto) {
    const product = await this.productService.findOne(
      params.productId,
      true,
    );
    return successResponse({ data: { product } });
  }

    @Auth([RoleEnum.user])
  @Patch(':productId/add-to-wishlist')
async addToWishlist(
  @User() user: UserDocument,
  @Param() params: ProductParamsDto,
):Promise<IResponse> {
const product = await this.productService.addToWishlist(params.productId, user);
return successResponse({ data: { product } });
}

    @Auth([RoleEnum.user])
  @Patch(':productId/remove-from-wishlist')
async removeFromWishlist(
  @User() user: UserDocument,
  @Param() params: ProductParamsDto,
):Promise<IResponse> {
await this.productService.removeFromWishlist(params.productId, user);
return successResponse();
}

}
