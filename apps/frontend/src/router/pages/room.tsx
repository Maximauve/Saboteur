import { type Board } from "@saboteur/api/src/domain/model/board";
import { type UserGame, type UserGamePublic } from "@saboteur/api/src/domain/model/user";
import { type Message, WebsocketEvent } from "@saboteur/api/src/domain/model/websocket";
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast, type ToastContent } from "react-toastify";

import Game from "@/components/game";
import Lobby from "@/components/lobby";
import { useGame } from "@/context/game/game-provider";
import { useSocket } from '@/context/socket/socket-provider';
import useAuth from "@/hooks/use-auth";

export default function Room(): React.JSX.Element {
  const { user } = useAuth();
  const socket = useSocket();
  const { code } = useParams();
  const { setMembers, gameIsStarted, setGameIsStarted, addChatMessage, setMessagesChat, setBoard, setMyUser, setDeckLength, openRoleModal, openSaboteurWinModal, openNainWinModal, setGoldList } = useGame();

  useEffect(() => {
    if (!socket) {
      return;
    }
    if (!user) {
      return;
    }

    socket?.on('connect', () => {
      socket?.emitWithAck(WebsocketEvent.JOIN_ROOM, code)
        .then((response) => {
          if (response && response.error) {
            console.error(response.error);
            toast.error(response.error as ToastContent<string>);
            return false;
          }
          return true;
        })
        .catch((error: Error) => {
          console.error(error);
        });
    });

    socket?.on(WebsocketEvent.MEMBERS, (newMembers: UserGamePublic[]) => {
      setMembers(newMembers);
    });

    socket?.on(WebsocketEvent.GAME_IS_STARTED, (started: boolean) => {
      setGameIsStarted(started);
    });

    socket?.on(WebsocketEvent.CHAT, (message: Message|Message[]) => {
      if (Array.isArray(message)) {
        setMessagesChat(message);
      } else {
        addChatMessage(message);
      }
    });

    socket?.on(WebsocketEvent.BOARD, (board: Board) => {
      setBoard(board);
    });

    socket?.on(WebsocketEvent.USER, (userGame: UserGame) => {
      setMyUser(userGame);
    });

    socket?.on(WebsocketEvent.DECK, (deckLength: number) => {
      setDeckLength(deckLength);
    });

    socket?.on(WebsocketEvent.SHOW_ROLE, () => {
      openRoleModal();
    });

    socket?.on(WebsocketEvent.END_ROUND, (({ type }) => {
      if (type === "SABOTEUR_WIN") {
        openSaboteurWinModal();
      } else {
        openNainWinModal();
      }
    }));

    socket?.on(WebsocketEvent.GOLD_LIST, (goldList: number[]) => {
      setGoldList(goldList);
    });

    return () => {
      socket.off(WebsocketEvent.MEMBERS);
      socket.off(WebsocketEvent.GAME_IS_STARTED);
      socket.off(WebsocketEvent.CHAT);
      socket.off(WebsocketEvent.BOARD);
      socket.off(WebsocketEvent.DECK);
      socket.off(WebsocketEvent.USER);
      socket.off(WebsocketEvent.SHOW_ROLE);
      socket.off(WebsocketEvent.END_ROUND);
      socket.off(WebsocketEvent.GOLD_LIST);
      socket.off('connect');
    };
  }, [socket, user]);

  return gameIsStarted ? <Game /> : <Lobby />;
}
