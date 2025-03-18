import React from "react";

import MemberRow from "@/components/game/MemberRow";
import { useGame } from "@/context/game/game-provider";

export default function GameMembersList(): React.JSX.Element {
  const { members } = useGame();

  return (
    <div className="ml-4 mt-4 flex flex-col gap-2">
      {members?.map((member) => (
        <MemberRow key={member.userId} member={member} />
      ))}
    </div>
  );
}
