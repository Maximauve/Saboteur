import { type Card, CardType } from '@saboteur/api/src/domain/model/card';
import { type UserGamePublic } from '@saboteur/api/src/domain/model/user';
import { WebsocketEvent } from '@saboteur/api/src/domain/model/websocket';
import React from 'react';
import { useDrop } from 'react-dnd';
import { toast, type ToastContent } from 'react-toastify';

import goldenNuggetImage from "@/assets/images/gold-nugget.png";
import MalusCard from "@/components/game/MalusCard";
import { useGame } from '@/context/game/game-provider';
import { useSocket } from '@/context/socket/socket-provider';

interface Properties {
  member: UserGamePublic
}

export default function MemberRow({ member }: Properties): React.JSX.Element {
  const socket = useSocket();
  const { myUser } = useGame();

  const [{ isOver }, dropReference] = useDrop<{ card: Card }, void, { isOver: boolean }>(() => ({
    accept: "CARD",
    canDrop: (item) => {
      if (myUser === undefined || !myUser.hasToPlay) {
        return false;
      }
      return (myUser?.userId !== member.userId) && (item.card.type === CardType.BROKEN_TOOL);
    },
    drop: (item) => {
      socket?.emitWithAck(WebsocketEvent.PLAY, { card: item.card, userReceiver: member })
        .then(response => {
          if (response && response.error) {
            toast.error(response.error as ToastContent<string>);
            return true;
          }
          return false;
        });
      console.log(`Carte ${item.card.imageUrl} placée sur ${member.userId} à l'emplacement XXX`);
    },
    collect: (monitor) => ({
      isOver: monitor.canDrop() && monitor.isOver(),
    }),
  }), [myUser, member]);


  return (
    <div ref={dropReference} className={`w-full flex justify-between items-center h-20 p-2
				${ member.hasToPlay === true ? "bg-green-600" : "bg-gray-100" }
				${ isOver ? 'border-2 border-dashed border-red-600' : '' }
			rounded-md shadow-md`}>
      <p className="font-bold">{member.username}</p>
      <div className="flex gap-4">
        <div className="flex gap-2">
          {member.malus.map((malus, slotIndex) => (
            <MalusCard key={slotIndex} user={member} card={malus} />
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
