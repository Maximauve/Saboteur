import { type UserSocket } from "@saboteur/api/src/domain/model/user";
import { WebsocketEvent } from "@saboteur/api/src/domain/model/websocket";
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Game from "@/components/game";
import Lobby from "@/components/lobby";
import { useGame } from "@/context/game/game-provider";
import { useSocket } from '@/context/socket/socket-provider';

export default function Room(): React.JSX.Element {
  const socket = useSocket();
  const { code } = useParams();
  const { setMembers, gameIsStarted, setGameIsStarted } = useGame();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket?.on('connect', () => {
      socket?.emitWithAck(WebsocketEvent.JOIN_ROOM, code);
    });

    socket?.on(WebsocketEvent.MEMBERS, (newMembers: UserSocket[]) => {
      setMembers(newMembers);
    });

    socket?.on(WebsocketEvent.GAME_IS_STARTED, (started: boolean) => {
      setGameIsStarted(started);
    }); 

    return () => {
      socket.off(WebsocketEvent.MEMBERS);
      socket.off(WebsocketEvent.GAME_IS_STARTED);
      socket.off('connect');
    };
  }, [socket]);

  return gameIsStarted ? <Lobby /> : <Game />;
}
