import { type UserM } from '@/domain/model/user';

export interface UserRepository {
  getAll(): Promise<UserM[]>;
  getOneById(id: string): Promise<UserM | null>;
  getUserByUsername(username: string): Promise<UserM | null>;
  insert(user: UserM): Promise<UserM>
}
