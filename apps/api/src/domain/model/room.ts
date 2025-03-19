import { type UserRoom, type UserSocket } from "@/domain/model/user";
import { type Message } from "@/domain/model/websocket";

export class Room {
  host: UserRoom;
  users: UserSocket[];
  code: string;
  started: boolean;
  currentRound: number;
  goldDeck: number[];
  messages: Message[];
}
