import {
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from '../dtos/signin.dto';
import { UsersService } from 'src/users/providers/users.service';
import { HashingProvider } from './hashing.provider';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class SignInProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    /**
     * Inject HashingProvider
     */
    private readonly hashingProvider: HashingProvider,

    /**
     * Inject jwtService
     */
    private readonly jwtService: JwtService,

    /**
     * Inject jwtConfiguration
     */
    @Inject(jwtConfig.KEY)
    private readonly jwtconfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async signIn(signInDto: SignInDto) {
    // find the user using email id
    const user = await this.usersService.findOneByEmail(signInDto.email);

    // compare password to the hash
    let isEqual: boolean = false;
    try {
      isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare passwords',
      });
    }

    // Wrong password
    if (!isEqual) {
      throw new UnauthorizedException('Incorrect password');
    }

    // send confirmation
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      } as ActiveUserData,
      {
        audience: this.jwtconfiguration.audience,
        issuer: this.jwtconfiguration.issuer,
        secret: this.jwtconfiguration.secret,
        expiresIn: this.jwtconfiguration.accessTokenTtl,
      },
    );

    return { accessToken };
  }
}
