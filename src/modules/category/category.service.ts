import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  CategoryDocument,
  CategoryRepository,
  Lean,
  UserDocument,
} from 'src/DB';
import { FolderEnum, S3Service } from 'src/common';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetAllCategoryDto } from './dto/update-category.dto';
import { Types } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<CategoryDocument> {
    const { name, description } = createCategoryDto;
    const checkDuplicated = await this.categoryRepository.findOne({
      filter: { name, paranoId: false },
    });
    if (checkDuplicated) {
      throw new ConflictException('Duplicated category name');
    }
    const image: string = await this.s3Service.uploadFile({
      file,
      path: FolderEnum.Category,
    });
    const [category] = await this.categoryRepository.create({
      data: [{ name, description, image, createdBy: user._id }],
    });
    if (!category) {
      await this.s3Service.deleteFile({ Key: image });
      throw new BadRequestException('Failed to create this category resource');
    }
    return category;
  }

  async findAll(
    data: GetAllCategoryDto,
    archive: boolean = false,
  ): Promise<{
    docsCount?: number;
    limit?: number;
    pages?: number;
    currentPage?: number | undefined;
    result: CategoryDocument[] | Lean<CategoryDocument>[];
  }> {
    const { page, size, search } = data;
    const result = await this.categoryRepository.paginate({
      filter: {
        ...(search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
              ],
            }
          : {}),
        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
      },
      page,
      size,
    });
    return result[0];
  }

  async findOne(
    categoryId: Types.ObjectId,
    archive: boolean = false,
  ): Promise<CategoryDocument | Lean<CategoryDocument>> {
    const category = await this.categoryRepository.findOne({
      filter: {
        _id: categoryId,
        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(
    categoryId: Types.ObjectId,
    updateCategoryDto: UpdateCategoryDto,
    user: UserDocument,
  ): Promise<CategoryDocument | Lean<CategoryDocument>> {
    if (
      updateCategoryDto.name &&
      (await this.categoryRepository.findOne({
        filter: { name: updateCategoryDto.name },
      }))
    ) {
      throw new ConflictException('Duplicated category name');
    }
    const category = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: categoryId },
      update: { ...updateCategoryDto, updatedBy: user._id },
    });
    if (!category) {
      throw new BadRequestException('Failed to update this category resource');
    }
    return category;
  }

  async updateAttachment(
    categoryId: Types.ObjectId,
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<CategoryDocument | Lean<CategoryDocument>> {
    const image = await this.s3Service.uploadFile({
      file,
      path: FolderEnum.Category,
    });
    const category = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: categoryId },
      update: { image, updatedBy: user._id },
      options: { new: false },
    });
    if (!category) {
      await this.s3Service.deleteFile({ Key: image });
      throw new BadRequestException('Failed to update this category resource');
    }
    await this.s3Service.deleteFile({ Key: category.image });
    category.image = image;
    return category;
  }

  async freeze(
    categoryId: Types.ObjectId,
    user: UserDocument,
  ): Promise<CategoryDocument | Lean<CategoryDocument>> {
    const category = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: categoryId },
      update: {
        freezedAt: new Date(),
        $unset: { restored: false },
        updatedBy: user._id,
      },
      options: { new: true },
    });

    if (!category) {
      throw new BadRequestException('Failed to update this category resource');
    }

    return category;
  }

  async remove(id: Types.ObjectId): Promise<string> {
    const category = await this.categoryRepository.findOneAndDelete({
      filter: { _id: id, paranoId: false, freezedAt: { $exists: true } },
    });

    if (!category) {
      throw new NotFoundException('Failed to REMOVE this category');
    }
    await this.s3Service.deleteFile({ Key: category.image });
    return 'Done';
  }
}
