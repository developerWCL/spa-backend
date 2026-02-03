import type { Spa } from 'src/entities/spa.entity';

declare global {
  namespace Express {
    interface Request {
      spa?: Spa;
    }
  }
}

export {};
