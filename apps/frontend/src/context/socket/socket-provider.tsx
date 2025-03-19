import React, { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io, type Socket } from "socket.io-client";

import useAuth from "@/hooks/use-auth";

type SocketType = Socket | null;

const SocketContext = createContext<SocketType>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

interface SocketProviderProperties {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProperties> = ({ children }) => {
  const [socket, setSocket] = useState<SocketType>(null);
  const { code } = useParams();
  const { user } = useAuth();

  // const NAMESPACE = "room";

  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_API_BASE_URL}room`, {
      query: {
        userId: user?.id,
        username: user?.username,
        code: code,
      },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
