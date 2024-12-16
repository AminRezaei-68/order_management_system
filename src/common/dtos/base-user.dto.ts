import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class BaseUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'The name can not be more than 20 character.' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'The username can not be more than 20 character.' })
  username: string;

  @IsString()
  @MinLength(8, { message: 'The password atleast should have 8 character.' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsEnum(UserRole, { message: 'Role must be either "user" or "admin".' })
  roles: UserRole[];

  @IsString()
  @IsNotEmpty({ message: 'You should enter the address.' })
  address: string;

  @IsBoolean()
  isActive: boolean = true;
}
