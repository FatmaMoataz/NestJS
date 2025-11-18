import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  CategoryParamsDto,
  GetAllCategoryDto,
  UpdateCategoryDto,
} from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import { Auth, User } from 'src/common/decorators';
import { endpoint } from '../category/authorization.module';
import { type UserDocument } from 'src/DB';
import { IResponse, successResponse } from 'src/common';
import { CategoryResponse, GetAllResponse } from './entities/category.entity';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseInterceptors(
    FileInterceptor(
      'file',
      cloudFileUpload({ validation: fileValidation.image }),
    ),
  )
  @Auth(endpoint.create)
  @Post()
  async create(
    @User() user: UserDocument,
    @Body() createBrandDto: CreateCategoryDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.create(
      createBrandDto,
      file,
      user,
    );
    return successResponse({ status: 201, data: { category } });
  }

  @Auth(endpoint.create)
  @Patch(':categoryId')
  async update(
    @Param() params: CategoryParamsDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.update(
      params.categoryId,
      updateCategoryDto,
      user,
    );
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({ validation: fileValidation.image }),
    ),
  )
  @Auth(endpoint.create)
  @Patch(':categoryId/attachment')
  async updateAttachment(
    @Param() params: CategoryParamsDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.updateAttachment(
      params.categoryId,
      file,
      user,
    );
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @Auth(endpoint.create)
  @Patch(':categoryId/restore')
  async restore(
    @Param() params: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.freeze(params.categoryId, user);
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @Auth(endpoint.create)
  @Delete(':categoryId/freeze')
  async freeze(
    @Param() params: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    await this.categoryService.freeze(params.categoryId, user);
    return successResponse<CategoryResponse>({
      message: 'Brand freezed successfully',
    });
  }

  @Auth(endpoint.create)
  @Delete(':categoryId')
  async remove(@Param() params: CategoryParamsDto, @User() user: UserDocument) {
    await this.categoryService.remove(params.categoryId);
    return successResponse<string>({
      message: 'Category removed successfully',
    });
  }

  @Get()
  async findAll(
    @Query() query: GetAllCategoryDto,
  ): Promise<IResponse<GetAllResponse>> {
    const result = await this.categoryService.findAll(query, false);
    return successResponse<GetAllResponse>({ data: { result } });
  }

  @Auth(endpoint.create)
  @Get('/archive')
  async findAllArchive(
    @Query() query: GetAllCategoryDto,
  ): Promise<IResponse<GetAllResponse>> {
    const result = await this.categoryService.findAll(query, true);
    return successResponse<GetAllResponse>({ data: { result } });
  }

  @Get(':categoryId')
  async findOne(@Param() params: CategoryParamsDto) {
    const category = await this.categoryService.findOne(
      params.categoryId,
      false,
    );
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @Auth(endpoint.create)
  @Get(':categoryId/archive')
  async findOneArchive(@Param() params: CategoryParamsDto) {
    const category = await this.categoryService.findOne(
      params.categoryId,
      true,
    );
    return successResponse<CategoryResponse>({ data: { category } });
  }
}
