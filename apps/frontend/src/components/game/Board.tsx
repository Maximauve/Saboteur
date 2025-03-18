import { type Board } from "@saboteur/api/src/domain/model/board";
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
    
    const isValid = validateCardPlacement(card, rowIndex, colIndex, board);

    if (card.type === CardType.INSPECT && board.grid[rowIndex][colIndex].type === CardType.END_HIDDEN) {
      console.log("Découvrir la carte cachée");
    }

    if (card.type === CardType.COLLAPSE && (board.grid[rowIndex][colIndex].type === CardType.PATH || board.grid[rowIndex][colIndex].type === CardType.DEADEND)) {
      console.log("Effondrement");
      const newBoard = { ...board };
      newBoard.grid[rowIndex][colIndex] = null;
      setBoard(newBoard);
    }

    if (isValid === true && board.grid[rowIndex][colIndex] === null) {
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
    <div className="p-4">
      <div className="inline-block bg-gray-100 p-3 rounded-lg shadow-md">
        <div className="flex flex-col">
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
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function validateCardPlacement(card: Card, rowIndex: number, colIndex: number, board: Board): boolean {
  if (card.type === CardType.PATH || card.type === CardType.DEADEND || card.type === CardType.INSPECT) {
    return true;
  }
  return false;
}
