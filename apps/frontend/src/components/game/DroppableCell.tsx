import { type Card } from "@saboteur/api/src/domain/model/card";
import { useDrop } from "react-dnd";

interface Properties {
  card: Card;
  colIndex: number;
  handleDrop: (item: { card: Card; colIndex: number; rowIndex: number }) => void;
  rowIndex: number;
}

export default function DroppableCell({ rowIndex, colIndex, card, handleDrop }: Properties) {
  const [{ isOver }, dropReference] = useDrop(() => ({
    accept: "CARD",
    drop: (item: { card: Card }) => {
      // Lors du drop, nous vérifions la rotation de la carte avant de la déposer
      handleDrop({ card: { ...item.card, isFlipped: item.card.isFlipped }, rowIndex, colIndex });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropReference}
      className={`w-12 h-20 flex justify-center items-center cursor-pointer transition-colors duration-200 rounded-sm p-px ${
        isOver ? "bg-green-300" : ""
      }`}
      title={`Position (${rowIndex}, ${colIndex})`}
    >
      {card ? (
        <img
          src={`/images/cards/${card.imageUrl}`}
          className="w-full h-full rounded-sm"
          style={{
            transform: `rotate(${card.isFlipped === true ? 180 : 0}deg)`,  // Applique la rotation de 180 si true
          }}
          alt="card"
        />
      ) : null}
    </div>
  );
}
