import { Injectable } from '@nestjs/common';
import { DatabaseRepository } from './database.repository';
import { OTP, OTPDocument as TDocument } from '../model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class OtpRepository extends DatabaseRepository<TDocument> {
  constructor(
    @InjectModel(OTP.name) protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
