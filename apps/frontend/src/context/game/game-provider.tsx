import { type Board } from "@saboteur/api/src/domain/model/board";
import { type UserGame } from "@saboteur/api/src/domain/model/user"; // Utiliser UserGame pour myUser
import { type UserGamePublic } from "@saboteur/api/src/domain/model/user"; // Utiliser UserGamePublic pour les membres
import { type Message } from "@saboteur/api/src/domain/model/websocket";
import React, { createContext, type ReactNode, useContext, useMemo, useState } from "react";

import useModal from "@/hooks/use-modal";


interface GameContextType {
  addChatMessage: (message: Message) => void;
  closeNainWinModal: () => void;
  closeRoleModal: () => void;
  closeSaboteurWinModal: () => void;
  deckLength: number;
  gameIsStarted: boolean;
  goldList: number[];
  isNainWinModalOpen: boolean;
  isRoleModalOpen: boolean;
  isSaboteurWinModalOpen: boolean;
  members: UserGamePublic[]; // Membres sont de type UserGamePublic pour ne pas exposer les cartes
  messagesChat: Message[];
  openNainWinModal: () => void;
  openRoleModal: () => void;
  openSaboteurWinModal: () => void;
  setBoard: (newBoard: Board) => void;
  setDeckLength: (nb: number) => void;
  setGameIsStarted: (started: boolean) => void;
  setGoldList: (list: number[]) => void;
  setMembers: (users: UserGamePublic[] | ((users: UserGamePublic[]) => UserGamePublic[])) => void; // setMembers pour UserGamePublic[]
  setMessagesChat: (messages: Message[]) => void;
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
  const [messagesChat, setMessagesChat] = useState<Message[]>([]);
  const [board, setBoard] = useState<Board>();
  const [deckLength, setDeckLength] = useState<number>(0);
  const [goldList, setGoldList] = useState<number[]>([]);
  const { isOpen: isRoleModalOpen, openModal: openRoleModal, closeModal: closeRoleModal } = useModal();
  const { isOpen: isSaboteurWinModalOpen, openModal: openSaboteurWinModal, closeModal: closeSaboteurWinModal } = useModal();
  const { isOpen: isNainWinModalOpen, openModal: openNainWinModal, closeModal: closeNainWinModal } = useModal();

  const addChatMessage = (message: Message) => {
    setMessagesChat((previousChat: Message[]) => [...previousChat, message]);
  };

  const values = useMemo(() => ({
    members,
    setMembers,
    gameIsStarted,
    setGameIsStarted,
    myUser,
    messagesChat,
    setMessagesChat,
    addChatMessage,
    board,
    setBoard,
    setMyUser,
    deckLength,
    setDeckLength,
    isRoleModalOpen,
    openRoleModal,
    closeRoleModal,
    openNainWinModal,
    closeNainWinModal,
    openSaboteurWinModal,
    closeSaboteurWinModal,
    isNainWinModalOpen,
    isSaboteurWinModalOpen,
    goldList,
    setGoldList,
  }), [members, messagesChat, myUser, gameIsStarted, board, deckLength, isRoleModalOpen, isSaboteurWinModalOpen, isNainWinModalOpen, goldList]);

  return (
    <GameContext.Provider value={values}>{children}</GameContext.Provider>
  );
};
