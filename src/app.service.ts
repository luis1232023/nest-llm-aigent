import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  async getHello(): Promise<string> {
    const opeapi_key= this.configService.get<string>('OPENAPI_KEY');
    return JSON.stringify("hello world"+opeapi_key);
  }
}
