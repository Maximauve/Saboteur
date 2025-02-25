import { type UserM } from '@/domain/model/user';

export interface UserRepository {
  getAll(): Promise<User>
  getUserByUsername(username: string): Promise<UserM>;
}
