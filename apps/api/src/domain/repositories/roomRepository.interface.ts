import { type Room } from "@/domain/model/room";
import { type UserFromRequest } from "@/domain/model/user";

export interface RoomRepository {
  createRoom(user: UserFromRequest): Promise<Room>;
}