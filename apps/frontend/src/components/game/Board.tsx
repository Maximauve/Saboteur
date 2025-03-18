import { type Board } from "@saboteur/api/src/domain/model/board";
import { type Card, CardType } from "@saboteur/api/src/domain/model/card";
import React from "react";
import { useDrop } from "react-dnd";

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

      console.log(`Carte ${card.imageUrl} ${card.type} ${card.rotation} placée sur la cellule (${rowIndex}, ${colIndex}) avec rotation de ${card.rotation}°`);
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
              {row.map((cell: Card, colIndex: number) => (
                <DroppableCell
                  key={`cell-${rowIndex}-${colIndex}`}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  cell={cell}
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

function DroppableCell({
  rowIndex,
  colIndex,
  cell,
  handleDrop,
}: {
  cell: Card;
  colIndex: number;
  handleDrop: (item: { card: Card; colIndex: number; rowIndex: number }) => void;
  rowIndex: number;
}) {
  const [{ isOver }, dropReference] = useDrop(() => ({
    accept: "CARD",
    drop: (item: { card: Card }) => {
      // Lors du drop, nous vérifions la rotation de la carte avant de la déposer
      handleDrop({ card: { ...item.card, rotation: item.card.rotation }, rowIndex, colIndex });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropReference}
      className={`w-12 h-20 flex justify-center items-center cursor-pointer transition-colors duration-200 rounded-sm ${
        isOver ? "bg-green-300" : ""
      }`}
      title={`Position (${rowIndex}, ${colIndex})`}
    >
      {cell ? (
        <img
          src={`/images/cards/${cell.imageUrl}`}
          className="w-full h-full rounded-sm"
          style={{
            transform: `rotate(${cell.rotation === true ? 180 : 0}deg)`,  // Applique la rotation de 180 si true
          }}
          alt="card"
        />
      ) : null}
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function validateCardPlacement(card: Card, rowIndex: number, colIndex: number, board: Board): boolean {
  if (card.type === CardType.PATH || card.type === CardType.DEADEND || card.type === CardType.COLLAPSE || card.type === CardType.INSPECT) {
    return true;
  }
  return false;
}
