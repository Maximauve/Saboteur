import { type Card, CardType } from "@saboteur/api/src/domain/model/card";
import React from "react";

import DroppableCell from "@/components/game/DroppableCell";
import { useGame } from "@/context/game/game-provider";

export default function GameBoard(): React.JSX.Element {
  const { board, setBoard } = useGame();

  if (!board || !board.grid) {
    return <div className="p-4 text-gray-700">Chargement du plateau...</div>;
  }

  const handleCardDrop = (item: { card: Card; colIndex: number; rowIndex: number }) => {
    const { card, rowIndex, colIndex } = item;

    if (card.type === CardType.INSPECT && board.grid[rowIndex][colIndex].type === CardType.END_HIDDEN) {
      console.log("Découvrir la carte cachée");
    }

    if (card.type === CardType.COLLAPSE && (board.grid[rowIndex][colIndex].type === CardType.PATH || board.grid[rowIndex][colIndex].type === CardType.DEADEND) && board.grid[rowIndex][colIndex] !== null) {
      console.log("Effondrement");
      const newBoard = { ...board };
      newBoard.grid[rowIndex][colIndex] = null;
      setBoard(newBoard);
    }

    if ((card.type === CardType.PATH || card.type === CardType.DEADEND) && board.grid[rowIndex][colIndex] === null) {
      const newBoard = { ...board };
      newBoard.grid[rowIndex][colIndex] = {
        ...card,  
      };
      setBoard(newBoard);

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

