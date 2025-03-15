import { type Room } from "@/domain/model/room";
import { type UserFromRequest, type UserGamePublic, type UserSocket } from "@/domain/model/user";

export interface RoomRepository {
  addUserToRoom(code: string, user: UserSocket): Promise<void>;
  createRoom(user: UserFromRequest): Promise<Room>;
  gameIsStarted(code: string): Promise<boolean>;
  getRoom(code: string): Promise<Room>
  getRoomUsers(code: string): Promise<UserGamePublic[]>;
  getSocketId(code: string, userId: string): Promise<string | undefined>;
  isHost(code: string, user:UserSocket): Promise<boolean>;
  removeUserToRoom(code: string, user: UserSocket): Promise<void>;
}