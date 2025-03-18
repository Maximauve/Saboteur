import { type Card, type ObjectiveCard } from "@/domain/model/card";
import { type Role } from "@/domain/model/role";

export class UserWithoutPassword {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdDate: Date;
}

export class UserFromRequest {
  id: string;
  username: string;
  email: string;
}

export class UserM extends UserWithoutPassword {
  password: string;
}

// IN GAME
export class UserRoom {
  username: string;
  userId: string;
  isHost: boolean;
}

export class UserSocket extends UserRoom {
  socketId: string;
  ready: boolean;
  gold: number;
}

export class UserGamePublic extends UserSocket {
  malus: Card[];
  hasToPlay: boolean;
}

export class UserGame extends UserGamePublic {
  cards: Card[];
  isSaboteur: boolean;
  cardsRevealed: ObjectiveCard[]; // objectif que le user a déjà révélées
}



