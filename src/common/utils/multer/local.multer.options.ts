import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { IMulterFile } from 'src/common/interfaces';

export const localFileUpload = ({folder='public'}:{folder?:string}) => {
    let basePath = `uploads/${folder}`
  return {
    storage: diskStorage({
      destination(req: Request, file: Express.Multer.File, callback: Function) {
        const fullPath = path.resolve(`./${basePath}`)
        if(!existsSync(fullPath)) {
mkdirSync(fullPath , {recursive:true})
        }
        callback(null, fullPath);
      },
      filename(req: Request, file: IMulterFile, callback: Function) {
        const fileName =
          randomUUID() + '_' + Date.now() + '_' + file.originalname;
          file.finalPath = basePath + `/${fileName}`
        callback(null, fileName);
      },
    }),
  };
};
