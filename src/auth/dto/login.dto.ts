import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Username or Email cannot be empty.' })
  usernameOrEmail: string;

  @IsString()
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  password: string;
}
