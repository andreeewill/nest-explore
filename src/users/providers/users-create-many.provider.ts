import {
  ConflictException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { User } from '../user.entity';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';

@Injectable()
export class UsersCreateManyProvider {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Create many users
   */
  public async createMany(createManyUsersDto: CreateManyUsersDto) {
    const newUsers: User[] = [];

    // Create query runner instance
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      // connect instance to data source
      await queryRunner.connect();

      // start transaction
      queryRunner.startTransaction();
    } catch (error) {
      throw new RequestTimeoutException('Could not connect to the database');
    }

    try {
      for (const user of createManyUsersDto.users) {
        const newUser = queryRunner.manager.create(User, user);

        const result = await queryRunner.manager.save(newUser);

        newUsers.push(result);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new ConflictException('Could not complete the transaction', {
        description: String(error),
      });
    } finally {
      try {
        await queryRunner.release();
      } catch (error) {
        throw new RequestTimeoutException('Could not release the connection', {
          description: String(error),
        });
      }
    }

    return newUsers;
  }
}
