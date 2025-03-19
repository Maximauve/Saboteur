import { type Card } from "@saboteur/api/src/domain/model/card";
import { WebsocketEvent } from "@saboteur/api/src/domain/model/websocket";
import React from "react";
import { toast, type ToastContent } from "react-toastify";

import DroppableCell from "@/components/game/DroppableCell";
import { useGame } from "@/context/game/game-provider";
import { useSocket } from "@/context/socket/socket-provider";

export default function GameBoard(): React.JSX.Element {
  const { board } = useGame();
  const socket = useSocket();

  if (!board || !board.grid) {
    return <div className="p-4 text-gray-700">Chargement du plateau...</div>;
  }

  const handleCardDrop = (item: { card: Card; colIndex: number; rowIndex: number }) => {
    const { card, rowIndex, colIndex } = item;

    console.group("CardDrop");

    console.log("Card", card);
    console.log("x", rowIndex);
    console.log("y", colIndex);

    console.groupEnd();

    socket?.emitWithAck(WebsocketEvent.PLAY, { card: card, x: rowIndex, y: colIndex })
      .then(response => {
        if (response && response.error) {
          toast.error(response.error as ToastContent<string>);
          return true;
        }
        return false;
      });
  };

  return (
    <div className="flex justify-center p-4">
      <div className="flex flex-col bg-gray-100  p-3 rounded-lg shadow-md">
        {board.grid.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex">
            {row.map((card: Card, colIndex: number) => (
              <DroppableCell
                key={`cell-${rowIndex}-${colIndex}`}
                rowIndex={rowIndex}
                colIndex={colIndex}
                card={card}
                handleDrop={handleCardDrop}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

