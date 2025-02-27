import { type UserRoom, type UserSocket } from "@/domain/model/user";

export class Room {
  host: UserRoom;
  users: UserSocket[];
  code: string;
  started: boolean;
  currentRound: number;
}