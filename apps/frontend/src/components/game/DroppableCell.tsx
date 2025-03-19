import { type Card, CardType, type ObjectiveCard } from "@saboteur/api/src/domain/model/card";
import { useEffect, useState } from "react";
import { useDrop } from "react-dnd";

import { useGame } from "@/context/game/game-provider";
import { isCardPlacementValid } from "@/services/card-functions";

interface Properties {
  card: Card;
  colIndex: number;
  handleDrop: (item: { card: Card; colIndex: number; rowIndex: number }) => void;
  rowIndex: number;
}

export default function DroppableCell({ rowIndex, colIndex, card, handleDrop }: Properties) {
  const { board, myUser } = useGame();
  const [revealedType, setRevealedType] = useState<string|null>(null);

  const [{ isOver, canBeDropped }, dropReference] = useDrop(() => ({
    accept: "CARD",
    canDrop: (item: {card: Card}) => {
      if (myUser === undefined || !myUser.hasToPlay) {
        return false;
      }
      if ([CardType.DEADEND, CardType.PATH].includes(item.card.type)) {
        if (myUser.malus.length > 0) {
          return false;
        }
        return isCardPlacementValid(item.card, board!, { x: rowIndex, y: colIndex });
      }
      if (item.card.type === CardType.INSPECT && card !== null && card.type === CardType.END_HIDDEN) {
        return true;
      }
      if (item.card.type === CardType.COLLAPSE && card !== null && [CardType.DEADEND, CardType.PATH].includes(card.type)) {
        return true;
      }
      return false;
    },
    drop: (item: { card: Card }) => {
      handleDrop({ card: item.card, rowIndex, colIndex });
    },
    collect: (monitor) => ({
      isOver: monitor.canDrop() && monitor.isOver(),
      canBeDropped: monitor.canDrop(),
    }),
  }), [card, board, myUser]);

  useEffect(() => {
    if (card && card.type === CardType.END_HIDDEN && !!myUser) {
      const revealedCard: ObjectiveCard =  myUser.cardsRevealed?.find(userCard => userCard.x === rowIndex && userCard.y === colIndex);
      if (revealedCard) {
        setRevealedType(revealedCard.type.toLowerCase() + ".png");
      }
    } else {
      setRevealedType(null);
    }
  }, [myUser, board, card]);

  return (
    <div
      ref={dropReference}
      className={`w-12 h-20 flex justify-center items-center cursor-pointer transition-colors duration-200 rounded-sm p-px no-select ${
        isOver ? "bg-green-300" : (canBeDropped ? "bg-yellow-400" : "")
      }`}
      title={`Position (${rowIndex}, ${colIndex})`}
    >
      {card ? (
        <img
          src={`/images/cards/${revealedType ?? card.imageUrl}`}
          className="w-full h-full rounded-sm no-select"
          style={{
            transform: `rotate(${card.isFlipped === true ? 180 : 0}deg)`,  // Applique la rotation de 180 si true
          }}
          alt="card"
        />
      ) : null}
    </div>
  );
}
