import { type UserSocket } from "@saboteur/api/src/domain/model/user";
import React, { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import useAuth from "@/hooks/use-auth";

interface GameContextType {
  gameIsStarted: boolean;
  members: UserSocket[];
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
    myUser
  }), [members]);

  return (
    <GameContext.Provider value={values}>{children}</GameContext.Provider>
  );
};