import { type Card } from "@/domain/model/card";
import { type UserSocket } from "@/domain/model/user";

export class Move {
  x: number;
  y: number;
  card: Card;
  userReceiver?: UserSocket;
}