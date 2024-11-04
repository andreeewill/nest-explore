import {
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FindOneUserByEmailProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Find existing user by it's email
   *
   * @param email
   * @returns
   */
  public async findOneByEmail(email: string) {
    let user: User | undefined = undefined;

    try {
      // null if not found
      user = await this.usersRepository.findOneBy({ email });
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not fetch the user',
      });
    }

    // Validates non existing user
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    return user;
  }
}
