import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateGoogleUserProvider } from './create-google-user.provider';
import { FindOneByGoogleIdProvider } from './find-one-by-google-id.provider';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';
import { CreateUserProvider } from './create-user.provider';
import { UsersCreateManyProvider } from './users-create-many.provider';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';

describe('Users service', () => {
  let service: UsersService;

  beforeEach(async () => {
    const mockCreateUserProvider: Partial<CreateUserProvider> = {
      createUser: (createUserDto: CreateUserDto) => {
        return Promise.resolve({
          id: 1,
          email: createUserDto.email,
          password: createUserDto.password,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          posts: [],
        });
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        // {
        //   provide: DataSource,
        //   useValue: {},
        // },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: CreateGoogleUserProvider,
          useValue: {},
        },
        {
          provide: FindOneByGoogleIdProvider,
          useValue: {},
        },
        {
          provide: FindOneUserByEmailProvider,
          useValue: {},
        },
        {
          provide: CreateUserProvider,
          useValue: mockCreateUserProvider,
        },
        {
          provide: UsersCreateManyProvider,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  test('Controller should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser method', () => {
    it('should be defined', () => {
      expect(service.createUser).toBeDefined();
    });

    it('should call createUser on CreateUserProvider', async () => {
      const user = await service.createUser({
        firstName: 'John',
        lastName: 'Doe',
        email: 'John@Doe.com',
        password: 'password',
      });

      expect(user.firstName).toEqual('John');
    });
  });
});
