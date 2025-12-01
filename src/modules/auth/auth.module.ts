import { Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthController } from './auth.controller';
import { OTPModel } from 'src/DB/model';
import { OtpRepository} from 'src/DB';
import { SecurityService } from 'src/common';
import { createClient } from 'redis';

@Module({
  imports: [OTPModel],
  providers: [
    AuthenticationService,
    SecurityService,
    OtpRepository,
    {
      provide:"REDIS_CLIENT",
      useFactory: async() => {
        const client = createClient({
          url:'redis://localhost:6379'
        })
        client.on("error" , (err) => console.error('Redis Client Error' , err))
        await client.connect()
        return client
      }
    }
  ],
  controllers: [AuthController],
  exports:["REDIS_CLIENT"]
})
export class AuthModule {}
