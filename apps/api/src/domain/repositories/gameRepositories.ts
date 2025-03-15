import { type Board } from "@/domain/model/board";
import { type Round } from "@/domain/model/round";
import { type UserGame, type UserSocket } from "@/domain/model/user";

export interface GameRepository {
  getBoard(code: string): Promise<Board>;
  getRound(code: string, roundNumber?: number): Promise<Round>;
  newRound(code: string): Promise<UserGame[]>;
  startGame(code: string, user: UserSocket): Promise<UserGame[]>;
}