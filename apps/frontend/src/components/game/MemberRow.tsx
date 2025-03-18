import { type Card, CardType } from '@saboteur/api/src/domain/model/card';
import { type UserGamePublic } from '@saboteur/api/src/domain/model/user';
import React from 'react';
import { useDrop } from 'react-dnd';

import goldenNuggetImage from "@/assets/images/gold-nugget.png";
import MalusCard from "@/components/game/MalusCard";

interface Properties {
  member: UserGamePublic
}

export default function MemberRow({ member }: Properties): React.JSX.Element {

  const [{ isOver }, dropReference] = useDrop<{ card: Card }, void, { isOver: boolean }>(() => ({
    accept: "CARD",
    canDrop: (item) => item.card.type === CardType.BROKEN_TOOL,
    drop: (item) => {

      // TODO Mattéo : envoyer au WS action d'attaque
  
      console.log(`Carte ${item.card.imageUrl} placée sur ${member.userId} à l'emplacement XXX`);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));


  return (
    <div ref={dropReference} className={`w-full flex justify-between items-center h-20 p-2
				${ member.hasToPlay === true ? "bg-green-600" : "bg-gray-100" }
				${ isOver ? 'border border-dotted border-red-600' : '' }
			rounded-md shadow-md`}>
      <p className="font-bold">{member.username}</p>
      <div className="flex gap-4">
        <div className="flex gap-2">
          {member.malus.map((malus, slotIndex) => (
            <MalusCard key={slotIndex} slotIndex={slotIndex} userId={member.userId} card={malus} />
          ))}
        </div>
        <div className="flex items-center">
          <p>{member.gold}</p>
          <img src={goldenNuggetImage} alt="Golden Nugget" className="w-12" />
        </div>
      </div>
    </div>
  );
};
