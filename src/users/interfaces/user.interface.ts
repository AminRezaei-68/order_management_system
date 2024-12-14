import { Document } from 'mongoose';

export interface UserInterface extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  isActive: boolean;
}
