import { type UserGame, type UserSocket } from "@/domain/model/user";

export interface GameRepository {
  newRound(code: string): Promise<UserGame[]>;
  startGame(code: string, user: UserSocket): Promise<UserGame[]>;
}