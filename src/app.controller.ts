import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { S3Service } from './common';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';
import type { Response } from 'express';

const s3WriteStreamPipeline = promisify(pipeline);

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/uploads/pre-signed/*path')
  async getPresignedAssetUrl(
    @Query() query: { download?: 'true' | 'false'; filename?: string },
    @Param() params: { path: [] },
  ) {
    const { download, filename } = query;
    const { path } = params as unknown as { path: string[] };
    const Key = path.join('/');
    const url = await this.s3Service.createGetPreSignedLink({
      Key,
      download,
      // API expects `downloadName`, not `filename`
      downloadName: filename || Key.split('/').pop(),
    });
    return { message: 'done', data: { url } };
  }

  @Get('/uploads/*path')
  async getAsset(
    @Query() query: { download?: 'true' | 'false'; filename?: string },
    @Param() params: { path: [] },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { download, filename } = query;
    const { path } = params as unknown as { path: string[] };
    const Key = path.join('/');
    const s3Response = await this.s3Service.getFile({ Key });
    if (!s3Response.Body) {
      throw new BadRequestException('Failed to fetch this asset');
    }
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-type', `${s3Response.ContentType}`);
    if (download === 'true') {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename || Key.split('/').pop()}"`,
      );
    }
    return await s3WriteStreamPipeline(
      s3Response.Body as NodeJS.ReadableStream,
      res,
    );
  }
}
