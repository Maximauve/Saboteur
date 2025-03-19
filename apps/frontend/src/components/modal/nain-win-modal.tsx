import { type UserGamePublic } from "@saboteur/api/src/domain/model/user";
import { WebsocketEvent } from "@saboteur/api/src/domain/model/websocket";
import { useEffect, useState } from "react";
import { toast, type ToastContent } from "react-toastify";

import FullModal from "@/components/modal/full-modal";
import { useGame } from "@/context/game/game-provider";
import { useSocket } from "@/context/socket/socket-provider";
import useTranslation from "@/hooks/use-translation";

export default function NainWinModal() {
  const socket = useSocket();
  const { isNainWinModalOpen, closeNainWinModal, myUser, goldList, members } = useGame();
  const [userSelected, setUserSelected] = useState<UserGamePublic | null>(null);
  const i18n = useTranslation();

  useEffect(() => {
    setUserSelected(members.find(member => member.hasToChooseGold) ?? null);
  }, [members]);

  useEffect(() => {
    if (goldList.length === 0) {
      closeNainWinModal();
    }
  }, [goldList]);

  const handleSelectGold = (gold: number) => {
    if (myUser?.hasToChooseGold) {
      socket?.emitWithAck(WebsocketEvent.CHOOSE_GOLD, gold)
        .then(response => {
          if (response && response.error) {
            toast.error(response.error as ToastContent<string>);
            return true;
          }
          return false;
        });
    } else {
      toast.error(i18n.t("game.notSelectGold") as ToastContent<string>);
    }
  };

  return (
    <FullModal isVisible={isNainWinModalOpen} onClose={closeNainWinModal} notClosable={goldList.length > 0} title="game.nain.nainWin">
      {myUser?.isSaboteur && (
        <p>{i18n.t("game.nain.saboteurLoose")}</p>
      )}
      {userSelected && (<p>C'est à {userSelected?.username} de sélectionner un nombre de pépites</p>)}
      <div className="flex m-5 gap-5">
        {goldList.map(gold => (
          <div className="w-20 h-32 flex justify-center items-center rounded-lg shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-2 hover:shadow-lg bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-yellow-600" onClick={() => handleSelectGold(gold)}>
            {gold}
          </div>
        ))}
      </div>
    </FullModal>
  );
}