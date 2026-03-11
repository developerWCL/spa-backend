import { Injectable } from '@nestjs/common';
import { COUNTRIES } from './constants/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getCountry(): { code: string; title: string }[] {
    return COUNTRIES;
  }
}
