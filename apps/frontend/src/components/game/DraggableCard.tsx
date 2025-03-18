import { type Card } from "@saboteur/api/src/domain/model/card";
import { motion } from "framer-motion";
import React, { Fragment, useState } from "react";
import { useDrag } from "react-dnd";

interface Properties {
  canRotate: boolean;
  card: Card;
  index: number;
}

export default function DraggableCard({ card, index, canRotate }: Properties): React.JSX.Element {
  const [rotation, setRotation] = useState<number>(0);

  const toggleFlip = () => {
    if (canRotate) {
      setRotation(previous => previous + 180);
    }
  };
   
  const [collected, dragReference] = useDrag(() => ({
    type: "CARD",
    item: { 
      id: index, 
      card: { 
        ...card,
        isFlipped: (rotation % 360) !== 0,
      } 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [rotation]);

  return (
    <Fragment>
      <div ref={dragReference} {...collected} className="relative cursor-grab" onClick={toggleFlip}>
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
    </Fragment>
  );
}
