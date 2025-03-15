import React from "react";

import Chatlist from "@/components/common/Chatlist";
import GameBoard from "@/components/game/Board";
import GameMembersList from "@/components/game/GameMembersList";

export default function Game(): React.JSX.Element {
  return (
    <div className="w-full h-full flex ">
      <div className="w-2/6 h-full">
        <GameMembersList />
        <Chatlist />
      </div>
      <div className="w-4/6 h-full">
        <GameBoard />
      </div>
    </div>
  );
}
