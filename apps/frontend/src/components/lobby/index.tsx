import { type UserSocket } from "@saboteur/api/src/domain/model/user";
import { WebsocketEvent } from "@saboteur/api/src/domain/model/websocket";
import React from "react";
import { useParams } from "react-router-dom";
import { toast, type ToastContent } from "react-toastify";

import Chatlist from "@/components/common/Chatlist";
import { useGame } from "@/context/game/game-provider";
import { useSocket } from "@/context/socket/socket-provider";


export default function Lobby(): React.JSX.Element {
  const { code } = useParams();
  const socket = useSocket();
  const { members, myUser } = useGame();
  
  const startGame = () => {
    socket?.emitWithAck(WebsocketEvent.START_GAME)
      .then((response) => {
        if (response && response.error) {
          toast.error(response.error as ToastContent<string>);
          return false;
        }
        return true;
      })
      .catch((error: Error) => {
        console.error(error);
      });;
  };

  return (
    <div>
      <h1>Room Page</h1>
      <p>Room Code: {code}</p>

      <div className="flex justify-center items-center flex-col">
        <h2 className="mt-6">Room members</h2>
        {members?.map((element: UserSocket, index: number) => (
          <p key={index}>{element.username}</p>
        ))}
      </div>

      <Chatlist />

      {myUser?.isHost && (
        <button onClick={startGame}>Lancer la partie</button>
      )}
    </div>
  );
}
