import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async findAll() {
    return this.userModel.find();
  }

  async findOne(id: string) {
    return this.userModel.findById(id);
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const existingUser = await this.userModel.findOne({ email: email }).exec();

    if (existingUser) {
      throw new BadRequestException('A user with this email already exists.');
    }

    const hashedPassword = await this.hashPassword(password);
    const user = new this.userModel({ ...createUserDto, hashedPassword });

    const savedUser = await user.save();

    return {
      id: savedUser._id.toString(),
      name: savedUser.name,
      email: savedUser.email,
      username: savedUser.username,
    };
  }
}
