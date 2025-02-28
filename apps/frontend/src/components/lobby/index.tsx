import { type UserSocket } from "@saboteur/api/src/domain/model/user";
import React from "react";
import { useParams } from "react-router-dom";

import { useGame } from "@/context/game/game-provider";


export default function Lobby(): React.JSX.Element {
  const { code } = useParams();
  const { members } = useGame();
  
  return (
    <div>
      <h1>Room Page</h1>
      <p>Room Code: {code}</p>

      <div className="flex justify-center items-center flex-col">
        <h2 className="mt-6">Room members</h2>
        {members?.map((element: UserSocket) => (
          <p>{element.username}</p>
        ))}
      </div>
    </div>
  );
}
