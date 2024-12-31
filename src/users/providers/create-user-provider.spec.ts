import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserProvider } from './create-user.provider';
import { MailService } from 'src/mail/provider/mail.service';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

type MockRepostory<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepostory<T> => {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
};

type MockMailService = Partial<Record<keyof MailService, jest.Mock>>;

describe('CreateUserProvider', () => {
  let provider: CreateUserProvider;
  let usersRepsitory: MockRepostory;
  let mailService: MockMailService;

  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'John@Doe.com',
    password: 'password',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserProvider,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
        {
          provide: MailService,
          useValue: {
            sendUserWelcome: jest.fn(() => Promise.resolve()),
          },
        },
        {
          provide: HashingProvider,
          useValue: {
            hashPassword: jest.fn(() => user.password),
          },
        },
      ],
    }).compile();

    provider = module.get<CreateUserProvider>(CreateUserProvider);
    mailService = module.get(MailService);
    usersRepsitory = module.get(getRepositoryToken(User));
  });

  test('Provider should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('createUser', () => {
    describe('When user does not exist inside database', () => {
      it('should create new user', async () => {
        usersRepsitory.findOne.mockResolvedValue(null);
        usersRepsitory.create.mockReturnValue(user);
        usersRepsitory.save.mockReturnValue(user);

        const newUser = await provider.createUser(user);

        expect(usersRepsitory.findOne).toHaveBeenCalledWith({
          where: { email: user.email },
        });
        expect(usersRepsitory.create).toHaveBeenCalledWith(user);
        expect(usersRepsitory.save).toHaveBeenCalledWith(user);

        // jest.spyOn(mailService, 'sendUserWelcome').mockResolvedValue('ok');
        mailService.sendUserWelcome.mockResolvedValue('oke');
      });
    });

    describe('When user exist inside database', () => {
      it('throw BadRequestException', async () => {
        usersRepsitory.findOne.mockResolvedValue(user.email);
        usersRepsitory.create.mockReturnValue(user);
        usersRepsitory.save.mockReturnValue(user);

        try {
          const newUser = await provider.createUser(user);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });
  });
});
