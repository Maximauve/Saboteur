import { type Card, CardType } from "@saboteur/api/src/domain/model/card";
import React from "react";

import DraggableCard from "@/components/game/DraggableCard";
import { useGame } from "@/context/game/game-provider";

export default function PlayerHand(): React.JSX.Element {
  const { myUser } = useGame();

  return (
    <div className="flex flex-row h-full place-content-center items-center">
      {myUser?.cards?.map((card: Card) => (
        <DraggableCard
          key={card.id}
          card={card}
          canRotate={card.type === CardType.DEADEND || card.type === CardType.PATH}
        />
      ))}
    </div>
  );
}
