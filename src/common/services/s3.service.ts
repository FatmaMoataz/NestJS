import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  GetObjectCommandOutput,
  DeleteObjectCommandOutput,
  DeleteObjectsCommandOutput,
  ListObjectsV2CommandOutput,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageEnum } from '../enums';
import { randomUUID } from 'crypto';
import { createReadStream } from 'fs';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
  }

  // ---------- Single file upload ----------
  async uploadFile({
    storageApproach = StorageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = 'private' as ObjectCannedACL,
    path = 'general',
    file,
  }: {
    storageApproach?: StorageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    file: Express.Multer.File;
  }): Promise<string> {
    const Key = `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${
      file.originalname
    }`;

    const command = new PutObjectCommand({
      Bucket,
      ACL,
      Key,
      Body:
        storageApproach === StorageEnum.memory
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    if (!Key) {
      throw new BadRequestException('Failed to generate upload key');
    }

    return Key;
  }

  // ---------- Multiple files upload ----------
  async uploadFiles({
    storageApproach = StorageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = 'private' as ObjectCannedACL,
    path = 'general',
    files,
    isLarge = false,
  }: {
    storageApproach?: StorageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    files: Express.Multer.File[];
    isLarge?: boolean;
  }): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    if (isLarge) {
      return Promise.all(
        files.map((file) =>
          this.uploadLargeFile({
            storageApproach,
            Bucket,
            ACL,
            path,
            file,
          }),
        ),
      );
    }

    return Promise.all(
      files.map((file) =>
        this.uploadFile({
          storageApproach,
          Bucket,
          ACL,
          path,
          file,
        }),
      ),
    );
  }

  // ---------- Large file upload (multipart) ----------
  async uploadLargeFile({
    storageApproach = StorageEnum.disk,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = 'private' as ObjectCannedACL,
    path = 'general',
    file,
  }: {
    storageApproach?: StorageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    file: Express.Multer.File;
  }): Promise<string> {
    const Key = `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${
      file.originalname
    }`;

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket,
        ACL,
        Key,
        Body:
          storageApproach === StorageEnum.memory
            ? file.buffer
            : createReadStream(file.path),
        ContentType: file.mimetype,
      },
    });

    upload.on('httpUploadProgress', (progress) => {
      console.log(progress);
    });

    const result = await upload.done();

    if (!result || !result.Key) {
      throw new BadRequestException('Failed to generate upload key');
    }

    return result.Key as string;
  }

  // ---------- Pre-signed PUT URL ----------
  async createPreSignUploadLink({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    expiresIn = Number(
      process.env.AWS_PRE_SIGNED_URL_EXPIRES_IN_SECONDS,
    ),
    path = 'general',
    ContentType,
    originalname,
  }: {
    Bucket?: string;
    path?: string;
    expiresIn?: number;
    originalname: string;
    ContentType: string;
  }): Promise<{ url: string; key: string }> {
    const Key = `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${originalname}`;

    const command = new PutObjectCommand({
      Bucket,
      Key,
      ContentType,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn });

    if (!url || !Key) {
      throw new BadRequestException('Failed to create pre-signed url');
    }

    return { url, key: Key };
  }

  // ---------- Pre-signed GET URL ----------
  async createGetPreSignedLink({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    expiresIn = Number(
      process.env.AWS_PRE_SIGNED_URL_EXPIRES_IN_SECONDS,
    ),
    Key,
    download = 'false',
    downloadName = 'dummy',
  }: {
    Bucket?: string;
    expiresIn?: number;
    Key: string;
    download?: string; // "true" / "false"
    downloadName?: string;
  }): Promise<string> {
    const disposition =
      download === 'true'
        ? `attachment; filename="${
            downloadName || Key.split('/').pop()
          }"`
        : undefined;

    const command = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentDisposition: disposition,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    if (!url) {
      throw new BadRequestException('Failed to create pre-signed url');
    }

    return url;
  }

  // ---------- Get file ----------
  async getFile({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
    });

    return this.s3Client.send(command);
  }

  // ---------- Delete single file ----------
  async deleteFile({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({
      Bucket,
      Key,
    });

    return this.s3Client.send(command);
  }

  // ---------- Delete multiple files ----------
  async deleteFiles({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    urls,
    Quiet = false,
  }: {
    Bucket?: string;
    urls: string[];
    Quiet?: boolean;
  }): Promise<DeleteObjectsCommandOutput> {
    const Objects = urls.map((url) => ({ Key: url }));

    const command = new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects,
        Quiet,
      },
    });

    return this.s3Client.send(command);
  }

  // ---------- List objects by prefix ----------
  async listDirectoryFiles({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    path,
  }: {
    Bucket?: string;
    path: string;
  }): Promise<ListObjectsV2CommandOutput> {
    const command = new ListObjectsV2Command({
      Bucket,
      Prefix: `${process.env.APPLICATION_NAME}/${path}`,
    });

    return this.s3Client.send(command);
  }

  // ---------- Delete folder (by prefix) ----------
  async deleteFolderByPrefix({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    path,
    Quiet = false,
  }: {
    Bucket?: string;
    path: string;
    Quiet?: boolean;
  }): Promise<DeleteObjectsCommandOutput> {
    const fileList = await this.listDirectoryFiles({ Bucket, path });

    if (!fileList?.Contents?.length) {
      throw new BadRequestException('Empty directory');
    }

    const urls: string[] =
      fileList.Contents?.map((file) => file.Key as string) ?? [];

    return this.deleteFiles({ Bucket, urls, Quiet });
  }
}
