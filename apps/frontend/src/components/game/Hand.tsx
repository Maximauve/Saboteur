import { type Card, CardType } from "@saboteur/api/src/domain/model/card";
import { motion } from "framer-motion";
import React, { useState } from "react";

import { useGame } from "@/context/game/game-provider";

export default function PlayerHand(): React.JSX.Element {
  const { cards } = useGame();
  const [rotation, setRotation] = useState<Record<number, number>>({});

  const toggleFlip = (index: number, card: Card) => {
    if (card.type === CardType.PATH || card.type === CardType.DEADEND) {
      setRotation((previous) => ({ ...previous, [index]: (previous[index] || 0) + 180 }));
    }
  };

  return (
    <div className="flex flex-row h-full place-content-center">
      {cards.map((card: Card, index) => (
        <div key={index} className="relative" onClick={() => toggleFlip(index, card)}>
          <motion.div
            animate={{ rotate: rotation[index] || 0 }}
            className="flex flex-col w-12 h-20 mx-1 border border-gray-300 rounded-sm shadow-md bg-white relative"
            transition={{ duration: 0.5 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <img
              src={`/images/cards/${card.imageUrl}`}
              className="w-full h-full rounded-sm"
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
}
