import { type Card, type ObjectiveCard } from "@/domain/model/card";

export class Board {
  grid: (Card | null)[][];
  startCard: Card;
  objectivePositions: ObjectiveCard[];
}