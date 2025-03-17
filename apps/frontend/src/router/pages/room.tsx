import { type Board } from "@saboteur/api/src/domain/model/board";
import { type UserSocket } from "@saboteur/api/src/domain/model/user";
import { type Message, WebsocketEvent } from "@saboteur/api/src/domain/model/websocket";
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast, type ToastContent } from "react-toastify";

import Game from "@/components/game";
import Lobby from "@/components/lobby";
import { useGame } from "@/context/game/game-provider";
import { useSocket } from '@/context/socket/socket-provider';

export default function Room(): React.JSX.Element {
  const socket = useSocket();
  const { code } = useParams();
  const { setMembers, gameIsStarted, setGameIsStarted, addChatMessage, setBoard } = useGame();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket?.on('connect', () => {
      socket?.emitWithAck(WebsocketEvent.JOIN_ROOM, code)
        .then((response) => {
          if (response && response.error) {
            toast.error(response.error as ToastContent<string>);
            return false;
          }
          return true;
        })
        .catch((error: Error) => {
          console.error(error);
        });
    });

    socket?.on(WebsocketEvent.MEMBERS, (newMembers: UserSocket[]) => {
      setMembers(newMembers);
    });

    socket?.on(WebsocketEvent.GAME_IS_STARTED, (started: boolean) => {
      setGameIsStarted(started);
    });

    socket?.on(WebsocketEvent.CHAT, (message: Message, user: UserSocket) => {
      addChatMessage({ ...message, username: user.username, userId: user.userId });
    });

    socket?.on(WebsocketEvent.BOARD, (board: Board) => {
      setBoard(board);
    });

    return () => {
      socket.off(WebsocketEvent.MEMBERS);
      socket.off(WebsocketEvent.GAME_IS_STARTED);
      socket.off('connect');
    };
  }, [socket]);

  return gameIsStarted ? <Game /> : <Lobby />;
}
