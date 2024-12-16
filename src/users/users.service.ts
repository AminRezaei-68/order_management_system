import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

type UserResponse = Partial<User> & { id: string };

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`The user with id: ${userId} is not exist.`);
    }

    const { currentPassword, newPassword } = changePasswordDto;

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;

    await user.save();

    return { message: 'Password updated successfully' };
  }

  async findByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<UserResponse | undefined> {
    const user = await this.userModel
      .findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      })
      .exec();

    return user
      ? { id: user._id.toString(), username: user.username, email: user.email }
      : undefined;
  }

  async updateStatus(
    userId: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const { isActive } = updateUserStatusDto;

    user.isActive = isActive;

    await user.save();

    return {
      message: `User status is changed to ${isActive ? 'active' : 'Inactive'}`,
    };
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.userModel.find().exec();

    return users.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    }));
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const { email, password, username } = createUserDto;

    const existingٍEmail = await this.findByUsernameOrEmail(email);
    const existingUsername = await this.findByUsernameOrEmail(username);

    if (existingٍEmail) {
      throw new BadRequestException('A user with this email already exists.');
    }

    if (existingUsername) {
      throw new BadRequestException(
        'A user with this username already exists.',
      );
    }

    const hashedPassword = await this.hashPassword(password);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    return {
      id: savedUser._id.toString(),
      name: savedUser.name,
      email: savedUser.email,
      username: savedUser.username,
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`The user with id: ${id} is not exist.`);
    }

    if (updateUserDto.email) {
      const userExists = await this.userModel
        .findOne({
          email: updateUserDto.email,
        })
        .exec();
      if (userExists && userExists.id === id) {
        throw new BadRequestException('This email is already in use.');
      }
    }

    if (updateUserDto.username) {
      const existingusername = await this.userModel
        .findOne({
          username: updateUserDto.username,
        })
        .exec();

      if (existingusername) {
        throw new BadRequestException(
          'A user with this username already exists.',
        );
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await user.save();

    return {
      id: updatedUser._id.toString(),
      username: updatedUser.username,
      email: updatedUser.email,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) {
      throw new NotFoundException(`The user with id: ${id} is not exist.`);
    }

    return { message: `User with ID "${id}" has been deleted.` };
  }
}
