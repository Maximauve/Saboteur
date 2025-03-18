import { type Card, CardType, type Tool } from "@saboteur/api/src/domain/model/card";
import { useDrop } from "react-dnd";

interface Properties {
  card: Tool
  slotIndex: number;
  userId: string;
}
export default function MalusCard({ slotIndex, userId }: Properties) {

  const [{ isOver }, dropReference] = useDrop<{ card: Card }, void, { isOver: boolean }>(() => ({
    accept: "CARD",
    canDrop: (item) => [CardType.REPAIR_DOUBLE, CardType.REPAIR_TOOL].includes(item.card.type),
    drop: (item) => {
      // TODO Mattéo : envoyer au WS action de réparation

      console.log(`Carte ${item.card.imageUrl} placée sur ${userId} à l'emplacement ${slotIndex + 1}`);
    },
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
