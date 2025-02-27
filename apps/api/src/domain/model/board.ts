import { type Card } from "@/domain/model/card";

export class Board {
  grid: unknown[][];
  startCard: Card;
  objectivePositions: { x: number, y:number }[];
}