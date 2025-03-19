import React from "react";

import { useGame } from "@/context/game/game-provider";

export default function Deck(): React.JSX.Element {
  const { deckLength } = useGame();
  return (
    <div className="flex flex-col m-2 justify-center items-center">
      <div className="w-12 h-20 border border-gray-300 rounded-sm shadow-md bg-white relative ">
        <img
          src="/images/cards/back.png"
          className="w-full h-full rounded-sm"
        />
      </div>
      <p className="absolute text-white font-bold text-xl">{deckLength}</p>
    </div>
  );
}