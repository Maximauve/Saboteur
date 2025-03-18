import { type Card, CardType } from "@saboteur/api/src/domain/model/card";
import { type UserGamePublic } from "@saboteur/api/src/domain/model/user";
import React from "react";
import { useDrop } from "react-dnd";

import goldenNuggetImage from "@/assets/images/gold-nugget.png";
import { useGame } from "@/context/game/game-provider";

export default function GameMembersList(): React.JSX.Element {
  const { members, setMembers } = useGame();

  return (
    <div className="ml-4 mt-4 flex flex-col gap-2">
      {members?.map((member, index) => (
        <DroppableMember key={index} member={member} setMembers={setMembers} />
      ))}
    </div>
  );
}

function DroppableMember({
  member,
  setMembers,
}: {
  member: UserGamePublic;
  setMembers: (members: UserGamePublic[] | ((members: UserGamePublic[]) => UserGamePublic[])) => void;
}) {
  return (
    <div className={`w-full flex justify-between items-center h-20 p-2 ${member.hasToPlay === true ? "bg-green-600" : "bg-gray-100" }  rounded-md shadow-md`}>
      <p className="font-bold">{member.username}</p>
      <div className="flex gap-4">
        <MemberCardSlots userId={member.userId} setMembers={setMembers} />
        <div className="flex items-center">
          <p>{member.gold}</p>
          <img src={goldenNuggetImage} alt="Golden Nugget" className="w-12" />
        </div>
      </div>
    </div>
  );
}

function MemberCardSlots({
  userId,
  setMembers,
}: {
  setMembers: (members: UserGamePublic[] | ((members: UserGamePublic[]) => UserGamePublic[])) => void;
  userId: string;
}) {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((slotIndex) => (
        <DroppableCardSlot key={slotIndex} slotIndex={slotIndex} userId={userId} setMembers={setMembers} />
      ))}
    </div>
  );
}

function DroppableCardSlot({
  slotIndex,
  userId,
  setMembers,
}: {
  setMembers: (members: UserGamePublic[] | ((members: UserGamePublic[]) => UserGamePublic[])) => void;
  slotIndex: number;
  userId: string;
}) {
  useGame();

  const [{ isOver }, dropReference] = useDrop<{ card: Card }, void, { isOver: boolean }>(() => ({
    accept: "CARD",
    drop: (item) => {
      if (item.card.type === CardType.PATH || item.card.type === CardType.DEADEND || item.card.type === CardType.COLLAPSE || item.card.type === CardType.INSPECT) {
        return;
      }

      setMembers((previousMembers: UserGamePublic[]) => {
        const updatedMembers = previousMembers.map((member: UserGamePublic) => {
          if (member.userId === userId) {
            const updatedMalus = member.malus
              ? [...member.malus, item.card].slice(0, 3) 
              : [item.card];

            return {
              ...member,
              malus: updatedMalus,
            };
          }
          return member;
        });

        return updatedMembers;
      });

      console.log(`Carte ${item.card.imageUrl} placée sur ${userId} à l'emplacement ${slotIndex + 1}`);
    },
    canDrop: (item) => item.card.type !== CardType.PATH && item.card.type !== CardType.DEADEND,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropReference}
      className={`w-12 h-16 border-2 border-dashed border-gray-400 rounded-sm flex items-center justify-center transition-colors ${
        isOver ? "bg-green-200" : "bg-white"
      }`}
    >
    </div>
  );
}
