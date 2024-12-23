import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { password, confirmPassword } = signupDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('The password not match.');
    }

    return this.userService.create(signupDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByUsernameOrEmail(
      loginDto.usernameOrEmail,
      true,
    );

    if (!user) {
      throw new UnauthorizedException('The user does not exist.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect password');
    }

    const payload = { sub: user.id, roles: user.roles };
    const token = this.jwtService.sign(payload);
    const expiresIn = 3600;

    return { message: 'Login successful', token, expiresIn };
  }
}
