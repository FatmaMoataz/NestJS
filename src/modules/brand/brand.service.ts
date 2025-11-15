import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandDocument, BrandRepository, Lean, UserDocument } from 'src/DB';
import { FolderEnum, S3Service, successResponse } from 'src/common';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Types } from 'mongoose';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly s3Service: S3Service,
  ) {}
  async create(
    createBrandDto: CreateBrandDto,
    file: Express.Multer.File,
    user: UserDocument,
  ):Promise<BrandDocument> {
    const { name, slogan } = createBrandDto;
    const checkDuplicated = await this.brandRepository.findOne({
      filter: { name },
    });
    if (checkDuplicated) {
      throw new ConflictException('Duplicated brand name');
    }
    const image:string = await this.s3Service.uploadFile({file, path:`Brand`})
    const [brand] = await this.brandRepository.create({
      data:[{name, slogan, image, createdBy:user._id}]
    })
    if(!brand) {
      await this.s3Service.deleteFile({Key:image})
      throw new BadRequestException("Failed to create this brand resource")
    }
    return brand;
  }

  findAll() {
    return `This action returns all brand`;
  }

  findOne(id: number) {
    return `This action returns a #${id} brand`;
  }

  async update(brandId: Types.ObjectId, updateBrandDto: UpdateBrandDto , user: UserDocument):Promise<BrandDocument | Lean<BrandDocument>> {
    if(updateBrandDto.name && (await this.brandRepository.findOne({filter:{name:updateBrandDto.name}}))) {
throw new ConflictException('Duplicated brand name')
    }
    const brand = await this.brandRepository.findOneAndUpdate({
     filter:{_id:brandId},
     update:{...updateBrandDto , 
      updatedBy:user._id
     },
    })
    if(!brand) {
      throw new BadRequestException("Failed to update this brand resource")
    }
    return brand;
  }

    async updateAttachment(brandId: Types.ObjectId, file: Express.Multer.File , user: UserDocument):Promise<BrandDocument | Lean<BrandDocument>> {
const image = await this.s3Service.uploadFile({file, path:FolderEnum.Brand})
    const brand = await this.brandRepository.findOneAndUpdate({
     filter:{_id:brandId},
     update:{image , 
      updatedBy:user._id
     },
     options:{new:false}
    })
    if(!brand) {
      await this.s3Service.deleteFile({Key:image})
      throw new BadRequestException("Failed to update this brand resource")
    }
    await this.s3Service.deleteFile({Key:brand.image})
    brand.image = image
    return brand;
  }

  remove(id: number) {
    return `This action removes a #${id} brand`;
  }
}
