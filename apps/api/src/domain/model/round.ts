import { type Board } from "@/domain/model/board";
import { type Card, type ObjectiveCard } from "@/domain/model/card";
import { type UserGame } from "@/domain/model/user";

export class Round {
  index: number;
  users: UserGame[];
  objectiveCards: ObjectiveCard[];
  treasurePosition: number;
  deck: Card[];
  board: Board;
  goldList: number[];
  revealedCards: ObjectiveCard[];
}
