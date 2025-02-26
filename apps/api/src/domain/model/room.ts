import { type UserRoom } from "@/domain/model/user";

export class Room {
  host: UserRoom;
  users: UserRoom[];
  code: string;
  started: boolean;
}