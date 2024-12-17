import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RolesGuard extends JwtAuthGuard implements CanActivate {
  constructor(
    protected reflector: Reflector,
    usersService: UsersService,
  ) {
    super(reflector, usersService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return requiredRoles.some((role) => user.role === role);
  }
}
