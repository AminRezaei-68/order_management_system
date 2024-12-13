import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'The name can not be more than 20 character.' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'The username can not be more than 20 character.' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'The password atleast should have 8 character.' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
