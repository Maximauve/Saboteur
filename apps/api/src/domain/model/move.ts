import { type Card } from "@/domain/model/card";
import { type UserSocket } from "@/domain/model/user";

export class Move {
  x?: number;
  y?: number;
  card: Card;
  userReceiver?: UserSocket;
  targettedMalusCard?: Card;
  discard?: boolean;
}

export class PlacedMove extends Move {
  x: number;
  y: number;
}
