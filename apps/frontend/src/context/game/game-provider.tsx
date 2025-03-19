import { type Board } from "@saboteur/api/src/domain/model/board";
import { type Card } from "@saboteur/api/src/domain/model/card";
import { type UserGame } from "@saboteur/api/src/domain/model/user"; // Utiliser UserGame pour myUser
import { type UserGamePublic } from "@saboteur/api/src/domain/model/user"; // Utiliser UserGamePublic pour les membres
import { type ChatMessage } from "@saboteur/api/src/domain/model/websocket";
import React, { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import useAuth from "@/hooks/use-auth";

interface GameContextType {
  addChatMessage: (message: ChatMessage) => void;
  cards: Card[];
  deckLength: number;
  gameIsStarted: boolean;
  members: UserGamePublic[]; // Membres sont de type UserGamePublic pour ne pas exposer les cartes
  messagesChat: ChatMessage[];
  setBoard: (newBoard: Board) => void;
  setCards: (cards: Card[]) => void;
  setDeckLength: (nb: number) => void;
  setGameIsStarted: (started: boolean) => void;
  setMembers: (users: UserGamePublic[] | ((users: UserGamePublic[]) => UserGamePublic[])) => void; // setMembers pour UserGamePublic[]
  board?: Board;
  myUser?: UserGame; // myUser est de type UserGame pour inclure les cartes et informations détaillées
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

interface GameProviderProperties {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProperties> = ({ children }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<UserGamePublic[]>([]); // Membres en UserGamePublic
  const [gameIsStarted, setGameIsStarted] = useState<boolean>(false);
  const [myUser, setMyUser] = useState<UserGame | undefined>(undefined); // myUser en UserGame pour inclure les cartes
  const [messagesChat, setMessagesChat] = useState<ChatMessage[]>([]);
  const [board, setBoard] = useState<Board>();
  const [cards, setCards] = useState<Card[]>([]);
  const [deckLength, setDeckLength] = useState<number>(0);

  const addChatMessage = (message: ChatMessage) => {
    setMessagesChat((previousChat: ChatMessage[]) => [...previousChat, message]);
  };

  useEffect(() => {
    if (members && user) {
      // Trouver myUser parmi les membres en utilisant UserGame, qui inclut les cartes
      setMyUser(members.find((member: UserGamePublic) => member.userId === user?.id) as UserGame);
    }
  }, [members, user]);

  const values = useMemo(() => ({
    members,
    setMembers,
    gameIsStarted,
    setGameIsStarted,
    myUser,
    messagesChat,
    addChatMessage,
    board,
    setBoard,
    cards,
    setCards,
    deckLength,
    setDeckLength,
  }), [members, messagesChat, myUser, gameIsStarted, board, deckLength]);

  return (
    <GameContext.Provider value={values}>{children}</GameContext.Provider>
  );
};
