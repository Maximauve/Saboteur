import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Chatlist from "@/components/common/Chatlist";
import GameBoard from "@/components/game/Board";
import Deck from "@/components/game/Deck";
import Discard from "@/components/game/Discard";
import GameMembersList from "@/components/game/GameMembersList";
import PlayerHand from "@/components/game/Hand";
import FullModal from "@/components/modal/full-modal";
import { useGame } from "@/context/game/game-provider";
import useTranslation from "@/hooks/use-translation";

export default function Game(): React.JSX.Element {
  const { isRoleModalOpen, closeRoleModal, myUser } = useGame();
  const [isReveal, setIsReveal] = useState<boolean>(false);
  const i18n = useTranslation();

  return (
    <DndProvider backend={HTML5Backend}>
      <FullModal isVisible={isRoleModalOpen} onClose={closeRoleModal} notClosable={!isReveal} title="game.yourRole">
        {myUser ? (
          <div className="flex flex-col items-center">
            <p>{i18n.t('game.clickToDisplay')}</p>
            <div 
              className="relative w-40 h-60 cursor-pointer" 
              onClick={() => setIsReveal(true)}
            >
              <div 
                className={`absolute inset-0 w-full h-full transition-transform duration-700 transform ${isReveal ? 'rotate-y-180' : ''}`}
              >
                {/* Face cachée */}
                <img 
                  src="/images/cards/back.png" 
                  className={`absolute w-full h-full backface-hidden ${isReveal ? 'hidden' : 'block'}`}
                />
                {/* Face révélée */}
                <img 
                  src={`/images/cards/${myUser.isSaboteur ? "saboteur" : "nain" }.png`}
                  className={`absolute w-full h-full backface-hidden ${isReveal ? 'block' : 'hidden'}`}
                />
              </div>
            </div>
          </div>
        ) : null}
      </FullModal>
      <div className="w-full h-full grid grid-cols-4 grid-rows-5 gap-4">
        <div className="col-span-1 row-span-5">
          <GameMembersList />
        </div>
        <div className="col-span-2 row-span-4">
          <GameBoard />
        </div>
        <div className="col-start-2 col-span-2 row-start-5">
          <PlayerHand />  
        </div>
        <div className="col-start-4 row-span-4">
          <Chatlist />
        </div>
        <div className="col-start-4 row-start-5 flex justify-evenly items-center">
          <Discard />
          <Deck />
        </div>
      </div>
    </DndProvider>
  );
}
