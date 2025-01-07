import { IsString, Matches, MinLength } from 'class-validator';
import { BaseUserDto } from '../../common/dtos/base-user.dto';

export class SignupDto extends BaseUserDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/, {
    message:
      'The password must contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  password: string;

  @IsString()
  @MinLength(8, { message: 'Confirm password must be at least 8 characters.' })
  confirmPassword: string;
}
