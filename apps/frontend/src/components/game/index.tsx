import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Chatlist from "@/components/common/Chatlist";
import GameBoard from "@/components/game/Board";
import Deck from "@/components/game/Deck";
import Discard from "@/components/game/Discard";
import GameMembersList from "@/components/game/GameMembersList";
import PlayerHand from "@/components/game/Hand";

export default function Game(): React.JSX.Element {
  return (
    <DndProvider backend={HTML5Backend}>
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
