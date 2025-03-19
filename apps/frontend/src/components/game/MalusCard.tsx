import { type Card, CardType } from "@saboteur/api/src/domain/model/card";
import { type UserGamePublic } from "@saboteur/api/src/domain/model/user";
import { WebsocketEvent } from "@saboteur/api/src/domain/model/websocket";
import { useDrop } from "react-dnd";
import { toast, type ToastContent } from "react-toastify";

import { useSocket } from "@/context/socket/socket-provider";

interface Properties {
  card: Card;
  user: UserGamePublic;
}
export default function MalusCard({ user, card }: Properties) {
  const socket = useSocket();

  const [{ isOver }, dropReference] = useDrop<{ card: Card }, void, { isOver: boolean }>(() => ({
    accept: "CARD",
    canDrop: (item) => [CardType.REPAIR_DOUBLE, CardType.REPAIR_TOOL].includes(item.card.type),
    drop: (item) => {
      socket?.emitWithAck(WebsocketEvent.PLAY, { card: item.card, userReceiver: user, targettedMalusCard: card })
        .then(response => {
          if (response && response.error) {
            toast.error(response.error as ToastContent<string>);
            return true;
          }
          return false;
        });
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropReference}
      className={`w-12 h-16 border-2 border-dashed border-gray-400 rounded-sm flex items-center justify-center transition-colors no-select ${
        isOver ? "border-green-200" : ""
      }`}
    >
      <img
        src={`/images/cards/${card.imageUrl}`}
        className="w-full h-full rounded-sm no-select"
        alt=""
      />
    </div>
  );
}
