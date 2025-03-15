import React from "react";

import goldenNuggetImage from "@/assets/images/gold-nugget.png";
import { useGame } from "@/context/game/game-provider";

export default function GameMembersList(): React.JSX.Element {
  const { members } = useGame();
  return (
    <div className="ml-4 mt-4 flex flex-col gap-2">
      {members?.map((member, index) => (
        <div key={index} className={`w-full flex justify-between items-center h-20`}>
          <p>{member.username}</p>
          <div className="flex items-center">
            <p>{member.gold}</p>
            <img src={goldenNuggetImage} alt="Golden Nugget" className="w-12"/>
          </div>
        </div>
      ))}
    </div>
  );
}