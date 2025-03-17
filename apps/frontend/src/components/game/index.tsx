import React from "react";

import Chatlist from "@/components/common/Chatlist";
import GameBoard from "@/components/game/Board";
import GameMembersList from "@/components/game/GameMembersList";
import PlayerHand from "@/components/game/Hand";

export default function Game(): React.JSX.Element {
  return (
    <div className="w-full h-full grid grid-cols-4 grid-rows-5 gap-4">
      <div className="col-span-1 row-span-4">
        <GameMembersList />
        <Chatlist />
      </div>
      <div className="col-span-3 row-span-4">
        <GameBoard />
      </div>
      <div className="col-span-4 row-span-1">
        <PlayerHand />  
      </div>
    </div>
    
  );
}
