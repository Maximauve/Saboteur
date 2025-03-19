import { type Board } from "@saboteur/api/src/domain/model/board";
import { type UserGame } from "@saboteur/api/src/domain/model/user"; // Utiliser UserGame pour myUser
import { type UserGamePublic } from "@saboteur/api/src/domain/model/user"; // Utiliser UserGamePublic pour les membres
import { type ChatMessage } from "@saboteur/api/src/domain/model/websocket";
import React, { createContext, type ReactNode, useContext, useMemo, useState } from "react";

import useModal from "@/hooks/use-modal";


interface GameContextType {
  addChatMessage: (message: ChatMessage) => void;
  closeRoleModal: () => void;
  deckLength: number;
  gameIsStarted: boolean;
  isRoleModalOpen: boolean;
  members: UserGamePublic[]; // Membres sont de type UserGamePublic pour ne pas exposer les cartes
  messagesChat: ChatMessage[];
  openRoleModal: () => void;
  setBoard: (newBoard: Board) => void;
  setDeckLength: (nb: number) => void;
  setGameIsStarted: (started: boolean) => void;
  setMembers: (users: UserGamePublic[] | ((users: UserGamePublic[]) => UserGamePublic[])) => void; // setMembers pour UserGamePublic[]
  setMyUser: (user: UserGame | undefined) => void;
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
  const [members, setMembers] = useState<UserGamePublic[]>([]); // Membres en UserGamePublic
  const [gameIsStarted, setGameIsStarted] = useState<boolean>(false);
  const [myUser, setMyUser] = useState<UserGame | undefined>(undefined); // myUser en UserGame pour inclure les cartes
  const [messagesChat, setMessagesChat] = useState<ChatMessage[]>([]);
  const [board, setBoard] = useState<Board>();
  const [deckLength, setDeckLength] = useState<number>(0);
  const { isOpen: isRoleModalOpen, openModal: openRoleModal, closeModal: closeRoleModal } = useModal();

  const addChatMessage = (message: ChatMessage) => {
    setMessagesChat((previousChat: ChatMessage[]) => [...previousChat, message]);
  };

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
    setMyUser,
    deckLength,
    setDeckLength,
    isRoleModalOpen,
    openRoleModal,
    closeRoleModal
  }), [members, messagesChat, myUser, gameIsStarted, board, deckLength, isRoleModalOpen]);

  return (
    <GameContext.Provider value={values}>{children}</GameContext.Provider>
  );
};
