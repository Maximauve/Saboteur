import { type UserM } from '@/domain/model/user';
import { type RegisterDto } from '@/infrastructure/controllers/auth/auth-dto';
import { type UpdatedUserDto } from '@/infrastructure/controllers/user/user.dto';

export interface UserRepository {
  checkUnknownUser(user: RegisterDto, userId?: string): Promise<boolean>;
  deleteById(userId: string): Promise<void>;
  getAll(): Promise<UserM[]>;
  getOneByEmail(email: string): Promise<UserM | null>;
  getOneById(id: string): Promise<UserM | null>;
  getUserByUsername(username: string): Promise<UserM | null>;
  insert(user: UserM): Promise<UserM>;
  update(userId: string, userBody: UpdatedUserDto): Promise<void>;
}
