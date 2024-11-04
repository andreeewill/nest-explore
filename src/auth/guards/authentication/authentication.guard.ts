import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { AUTH_TYPE_KEY } from 'src/auth/constants/auth.constants';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  > = {
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.None]: { canActivate: () => true }, // true means request will pass
  };

  constructor(
    /**
     *
     */
    private readonly reflector: Reflector,

    private readonly accessTokenGuard: AccessTokenGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // authTypes from reflector
    const authType = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    // array of guards
    const guards = authType.map((type) => this.authTypeGuardMap[type]);

    // loop guards canActivate
    for (const instance of guards) {
      console.log(instance);
      const instances = Array.isArray(instance) ? instance : [instance];

      // instances.forEach((guard) => guard.canActivate(context));
      for (const fn of instances) {
        const canActivate = await Promise.resolve(
          fn.canActivate(context),
        ).catch(() => false);

        console.log(canActivate);
        if (canActivate) return true;
      }
    }

    throw new UnauthorizedException();
  }
}
