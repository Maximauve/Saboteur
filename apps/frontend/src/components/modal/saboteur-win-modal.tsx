import FullModal from "@/components/modal/full-modal";
import { useGame } from "@/context/game/game-provider";
import useTranslation from "@/hooks/use-translation";

export default function SaboteurWinModal() {
  const { isSaboteurWinModalOpen, closeSaboteurWinModal } = useGame();
  const i18n = useTranslation();
  return (
    <FullModal isVisible={isSaboteurWinModalOpen} onClose={closeSaboteurWinModal} title="game.saboteurWin">
      <p>{i18n.t("game.saboteurInfo")}</p>
    </FullModal>
  );
}