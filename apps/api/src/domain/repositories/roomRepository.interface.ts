import { type Board } from "@/domain/model/board";
import { type Card } from "@/domain/model/card";
import { type Room } from "@/domain/model/room";
import { type Round } from "@/domain/model/round";
import { type UserGame, type UserGamePublic, type UserSocket } from "@/domain/model/user";

export interface RoomRepository {
  doesRoomExists(code: string): Promise<boolean>
  gameIsStarted(code: string): Promise<boolean>;
  getBoard(code: string): Promise<Board>;
  getCurrentRoundUser(code: string, userId: string): Promise<UserGame|null>;
  getDeck(code: string): Promise<Card[]>;
  getRoom(code: string): Promise<Room>;
  getRoomUsers(code: string): Promise<UserGamePublic[]>;
  getRound(code: string, roundNumber?: number): Promise<Round>;
  getSocketId(code: string, userId: string): Promise<string | undefined>;
  getUserGame(code: string, userId: string): Promise<UserGame>;
  isHost(code: string, user:UserSocket): Promise<boolean>;
  setRoom(code: string, values: string[]): Promise<void>;
  setRound(code: string, nbRound: number, values: string[]): Promise<void>;
}
