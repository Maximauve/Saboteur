import { type Card } from "@saboteur/api/src/domain/model/card";
import { motion } from "framer-motion";
import React, { Fragment, useState } from "react";
import { useDrag } from "react-dnd";

import { useGame } from "@/context/game/game-provider";

interface Properties {
  canRotate: boolean;
  card: Card;
}

export default function DraggableCard({ card, canRotate }: Properties): React.JSX.Element {
  const [rotation, setRotation] = useState<number>(0);
  const { myUser } = useGame();

  const toggleFlip = () => {
    if (canRotate) {
      setRotation(previous => previous + 180);
    }
  };
   
  const [, dragReference] = useDrag(() => ({
    type: "CARD",
    item: { 
      card: { 
        ...card,
        isFlipped: (rotation % 360) !== 0,
      }
    },
  }), [rotation, myUser]);

  return (
    <Fragment>
      <div ref={dragReference} className="relative cursor-grab h-min w-min no-select" onClick={toggleFlip}>
        <motion.div
          animate={{ rotate: rotation }} 
          className="flex flex-col w-12 h-20 mx-1 border border-gray-300 rounded-sm shadow-md bg-white relative"
          transition={{ duration: 0.5 }}
        >
          <img
            src={`/images/cards/${card.imageUrl}`}
            className={`w-full h-full rounded-sm ${myUser?.hasToPlay ? "" : "no-select"}`}
          />
        </motion.div>
      </div>
    </Fragment>
  );
}
