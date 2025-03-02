import { type UserSocket } from "@saboteur/api/src/domain/model/user";
import { type ChatMessage } from "@saboteur/api/src/domain/model/websocket";
import React, { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import useAuth from "@/hooks/use-auth";

interface GameContextType {
  addChatMessage: (message: ChatMessage) => void;
  gameIsStarted: boolean;
  members: UserSocket[];
  messagesChat: ChatMessage[];
  setGameIsStarted: (started: boolean) => void;
  setMembers: (users: UserSocket[]) => void;
  myUser?: UserSocket;
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
  const [members, setMembers] = useState<UserSocket[]>([]);
  const [gameIsStarted, setGameIsStarted] = useState<boolean>(false);
  const [myUser, setMyUser] = useState<UserSocket | undefined>(undefined);
  const [messagesChat, setMessagesChat] = useState<ChatMessage[]>([]);

  const addChatMessage = (message: ChatMessage) => {
    setMessagesChat((previousChat: ChatMessage[]) => [...previousChat, message]);
  };

  useEffect(() => {
    if (members) {
      setMyUser(members.find((member: UserSocket) => member.userId === user?.id));
    }
  }, [members]);

  const values = useMemo(() => ({
    members,
    setMembers,
    gameIsStarted,
    setGameIsStarted,
    myUser,
    messagesChat,
    addChatMessage
  }), [members, messagesChat, myUser, gameIsStarted]);

  return (
    <GameContext.Provider value={values}>{children}</GameContext.Provider>
  );
};