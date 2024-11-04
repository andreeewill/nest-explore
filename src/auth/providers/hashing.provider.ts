import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class HashingProvider {
  /** Abstract declaration */
  abstract hashPassword(data: string | Buffer): Promise<string>;

  /** Abstract declaration */
  abstract comparePassword(
    data: string | Buffer,
    encryptedPassword: string,
  ): Promise<boolean>;
}
