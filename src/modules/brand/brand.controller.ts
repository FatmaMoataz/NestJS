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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandRepository, type UserDocument } from 'src/DB';
import { IResponse, successResponse } from 'src/common';
import { Auth, User } from 'src/common/decorators';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import { BrandResponse } from './entities/brand.entity';
import { endpoint } from './authorization.module';
import { BrandParamsDto, UpdateBrandDto } from './dto/update-brand.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('brand')
export class BrandController {
  constructor(
    private readonly brandService: BrandService,
    private readonly brandRepository: BrandRepository,
  ) {}

  // replace direct Multer options in UseInterceptors with FileInterceptor
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
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.create(createBrandDto, file, user);
    return successResponse({ status: 201, data: { brand } });
  }

  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(+id);
  }

  @Patch(':brandId')
  update(
    @Param() params: BrandParamsDto,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandService.update(params.brandId, updateBrandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.remove(+id);
  }
}
