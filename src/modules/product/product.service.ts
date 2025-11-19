import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import {
  BrandRepository,
  CategoryDocument,
  CategoryRepository,
  ProductDocument,
  UserDocument,
} from 'src/DB';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { FolderEnum, S3Service } from 'src/common';
import { randomUUID } from 'crypto';
import {
  UpdateProductAttachmentDto,
  UpdateProductDto,
} from './dto/update-product.dto';
import { Types } from 'mongoose';

@Injectable()
export class ProductService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly brandRepository: BrandRepository,
    private readonly productRepository: ProductRepository,
    private readonly s3Service: S3Service,
  ) {}
  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
    user: UserDocument,
  ): Promise<ProductDocument> {
    const { name, description, originalPrice, stock, discountPercent } =
      createProductDto;
    const category = await this.categoryRepository.findOne({
      filter: { _id: createProductDto.category },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const brand = await this.brandRepository.findOne({
      filter: { _id: createProductDto.brand },
    });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    let assetFolderId = randomUUID();
    const images = await this.s3Service.uploadFiles({
      files,
      path: `${FolderEnum.Category}/${createProductDto.category}/${FolderEnum.Product}/${assetFolderId}`,
    });
    const [product] = await this.productRepository.create({
      data: [
        {
          category: category._id,
          brand: brand._id,
          name,
          description,
          discountPercent,
          originalPrice,
          salePrice: originalPrice - originalPrice * (discountPercent / 100),
          stock,
          assetFolderId,
          images,
          createdBy: user._id,
        },
      ],
    });
    if (!product) {
      throw new BadRequestException('Failed to create product');
    }
    return product;
  }

  async update(
    productId: Types.ObjectId,
    updateProductDto: UpdateProductDto,
    user: UserDocument,
  ): Promise<ProductDocument> {
    const product = await this.productRepository.findOne({
      filter: { _id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.category) {
      const category = await this.categoryRepository.findOne({
        filter: { _id: updateProductDto.category },
      });
      if (!category) {
        throw new NotFoundException('Category cannot be changed');
      }
      updateProductDto.category = category._id;
    }

    if (updateProductDto.brand) {
      const brand = await this.brandRepository.findOne({
        filter: { _id: updateProductDto.brand },
      });
      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
      updateProductDto.brand = brand._id;
    }
    let salePrice = product.salePrice;
    if (updateProductDto.originalPrice || updateProductDto.discountPercent) {
      const originalPrice =
        updateProductDto.originalPrice ?? product.originalPrice;
      const discountPercent =
        updateProductDto.discountPercent ?? product.discountPercent;
      const finalPrice =
        originalPrice - originalPrice * (discountPercent / 100);
      salePrice = finalPrice > 0 ? finalPrice : 1;
    }
    const updatedProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: {
        ...updateProductDto,
        salePrice,
        updatedBy: user._id,
      },
    });
    if (!updatedProduct) {
      throw new BadRequestException('Product not updated');
    }
    return updatedProduct as ProductDocument;
  }

  async updateAttachment(
    productId: Types.ObjectId,
    updateProductDto: UpdateProductDto,
    user: UserDocument,
    updateProductAttachmentDto: UpdateProductAttachmentDto,
    files?: Express.Multer.File[],
  ): Promise<ProductDocument> {
    const product = await this.productRepository.findOne({
      filter: { _id: productId },
      options: { populate: [{ path: 'category' }] },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    let attachments: string[] = [];
    if (files?.length) {
      attachments = await this.s3Service.uploadFiles({
        files,
        path: `${FolderEnum.Category}/${(product.category as unknown as CategoryDocument).assetFolderId}/${FolderEnum.Product}/${product.assetFolderId}`,
      });
    }
    const removedAttachments = [
      ...new Set(updateProductAttachmentDto.removedAttachments ?? []),
    ];
    const updatedProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: [
        {
          $set: {
            images: {
              $setUnion: [
                {
                  $setDifference: ['$images', removedAttachments],
                },
                attachments,
              ],
            },
          },
        },
      ],
    });
    if (!updatedProduct) {
      await this.s3Service.deleteFiles({urls:attachments})
      throw new BadRequestException('Product not updated');
    }
    await this.s3Service.deleteFiles({urls:removedAttachments})
    return updatedProduct as ProductDocument;
  }

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
