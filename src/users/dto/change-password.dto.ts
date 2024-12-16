import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Current password must be at least 8 characters.',
  })
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'New password must be at least 8 characters.',
  })
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/, {
    message:
      'The new password must contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  newPassword: string;
}
