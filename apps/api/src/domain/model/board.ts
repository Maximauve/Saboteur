import { type Card } from "@/domain/model/card";

export class Board {
  grid: (Card | null)[][];
  startCard: Card;
  objectivePositions: { x: number, y:number }[];
}