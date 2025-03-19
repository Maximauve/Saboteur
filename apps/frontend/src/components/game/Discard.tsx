import { type Card } from "@saboteur/api/src/domain/model/card";
import { WebsocketEvent } from "@saboteur/api/src/domain/model/websocket";
import React from "react";
import { useDrop } from "react-dnd";
import { toast, type ToastContent } from "react-toastify";

import { useGame } from "@/context/game/game-provider";
import { useSocket } from "@/context/socket/socket-provider";

export default function Discard(): React.JSX.Element {
  const { myUser } = useGame();
  const socket = useSocket();

  const [{ isOver }, dropReference] = useDrop<{ card: Card }, void, { isOver: boolean }>(() => ({
    accept: "CARD",
    canDrop: () => myUser !== undefined && myUser.hasToPlay,
    drop: (item) => {
      socket?.emitWithAck(WebsocketEvent.PLAY, { card: item.card, discard: true })
        .then(response => {
          if (response && response.error) {
            toast.error(response.error as ToastContent<string>);
            return true;
          }
          return false;
        });;
    },
    collect: (monitor) => ({
      isOver: monitor.canDrop() && monitor.isOver(),
    }),
  }), [myUser]);
    
  return (
    <div className="ml-4 mt-4 flex flex-col gap-2">
      <div
        ref={dropReference}
        className={`w-12 h-16 border-2 border-dashed border-gray-400 rounded-sm flex items-center justify-center transition-colors ${
          isOver ? "bg-green-300" : ""
        }`}
      >

      </div>
    </div>
  );
}
