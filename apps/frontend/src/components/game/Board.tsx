import { type Card } from "@saboteur/api/src/domain/model/card";
import React from "react";

// import backImage from "@/assets/images/back.png";
import { useGame } from "@/context/game/game-provider";

export default function GameBoard(): React.JSX.Element {
  const { board } = useGame();

  if (!board || !board.grid) {
    return <div className="p-4 text-gray-700">Chargement du plateau...</div>;
  }

  return (
    <div className="p-4">
      <div className="inline-block bg-gray-100 p-3 rounded-lg shadow-md">
        <div className="flex flex-col">
          {board.grid.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex">
              {row.map((cell: Card, colIndex: number) => (
                <div 
                  key={`cell-${rowIndex}-${colIndex}`} 
                  className={`w-12 h-20 flex justify-center items-center cursor-pointer transition-colors duration-200`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  title={`Position (${rowIndex}, ${colIndex})`}
                >
                  {renderCellContent(cell)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function handleCellClick(rowIndex: number, colIndex: number) {
  console.log(`Cellule cliquée: (${rowIndex}, ${colIndex})`);
}

function renderCellContent(cell: Card) {
  if (!cell) {
    return null;
  }

  return (
    <img src={`/images/cards/${cell.imageUrl}`} className="w-full h-full object-contain"/>
  );
}
