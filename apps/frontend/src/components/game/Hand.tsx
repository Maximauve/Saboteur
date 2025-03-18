import { type Card, CardType } from "@saboteur/api/src/domain/model/card";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useDrag } from "react-dnd";

import { useGame } from "@/context/game/game-provider";

export default function PlayerHand(): React.JSX.Element {
  const { cards } = useGame();
  const [rotation, setRotation] = useState<Record<number, number>>({}); // Stocke la rotation individuelle
  const [rotationBoolean, setRotationBoolean] = useState<Record<number, boolean>>({}); // Stocke le booléen par carte

  // Fonction pour ajouter 180° à la rotation et basculer rotationBoolean
  const toggleFlip = (index: number, card: Card) => {
    if (card.type === CardType.PATH || card.type === CardType.DEADEND) {
      setRotation((previous) => ({
        ...previous,
        [index]: (previous[index] || 0) + 180, // Tourne la carte actuelle de 180°
      }));
      setRotationBoolean((previous) => ({
        ...previous,
        [index]: !(previous[index] || false), // Bascule true/false
      }));
      card.rotation = !rotationBoolean[index] || false; // Envoie le booléen pour le board
    }
    console.log(`${card.imageUrl} ${card.type} ${card.rotation}°`);
  };

  return (
    <div className="flex flex-row h-full place-content-center">
      {cards.map((card: Card, index) => (
        <DraggableCard
          key={index}
          card={card}
          index={index}
          rotation={rotation[index] || 0} // Rotation propre à chaque carte
          rotationBoolean={rotationBoolean[index] || false} // Booléen propre à chaque carte
          onFlip={() => toggleFlip(index, card)}
        />
      ))}
    </div>
  );
}

function DraggableCard({
  card,
  index,
  rotation,
  rotationBoolean,
  onFlip,
}: {
  card: Card;
  index: number;
  onFlip: () => void;
  rotation: number;
  rotationBoolean: boolean;
}) {
  // eslint-disable-next-line unused-imports/no-unused-vars, no-unused-vars
  const [{ isDragging }, dragReference] = useDrag(() => ({
    type: "CARD",
    item: { 
      id: index, 
      card: { 
        ...card, 
        rotation: rotationBoolean // Envoie seulement le booléen pour le board
      } 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));;

  return (
    <div ref={dragReference} className="relative cursor-grab" onClick={onFlip}>
      <motion.div
        animate={{ rotate: rotation }} 
        className="flex flex-col w-12 h-20 mx-1 border border-gray-300 rounded-sm shadow-md bg-white relative"
        transition={{ duration: 0.5 }}
      >
        <img
          src={`/images/cards/${card.imageUrl}`}
          className="w-full h-full rounded-sm"
        />
      </motion.div>
    </div>
  );
}
