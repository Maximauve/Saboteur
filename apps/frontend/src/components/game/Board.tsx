import { type Card, CardType } from "@saboteur/api/src/domain/model/card";
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

    if (card.type === CardType.INSPECT && board.grid[rowIndex][colIndex].type === CardType.END_HIDDEN) {
      console.log("Découvrir la carte cachée");
    }

    if (card.type === CardType.COLLAPSE && (board.grid[rowIndex][colIndex].type === CardType.PATH || board.grid[rowIndex][colIndex].type === CardType.DEADEND) && board.grid[rowIndex][colIndex] !== null) {
      socket?.emitWithAck(WebsocketEvent.PLAY, { card: card, x: rowIndex, y: colIndex })
        .then(response => {
          if (response && response.error) {
            toast.error(response.error as ToastContent<string>);
            return true;
          }
          return false;
        });
    }

    if ((card.type === CardType.PATH || card.type === CardType.DEADEND) && board.grid[rowIndex][colIndex] === null) {
      socket?.emitWithAck(WebsocketEvent.PLAY, { card: card, x: rowIndex, y: colIndex })
        .then(response => {
          if (response && response.error) {
            toast.error(response.error as ToastContent<string>);
            return true;
          }
          return false;
        });
      console.log(`Carte ${card.imageUrl} ${card.type} placée sur la cellule (${rowIndex}, ${colIndex}) avec rotation : ${card.isFlipped}`);
    } else {
      console.log(`Carte ${card.imageUrl} ${card.type} non valide pour cette position.`);
    }
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

