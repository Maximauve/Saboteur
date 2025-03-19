import { type UserSocket } from "@saboteur/api/src/domain/model/user";
import { WebsocketEvent } from "@saboteur/api/src/domain/model/websocket";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast, type ToastContent } from "react-toastify";

import Chatlist from "@/components/common/Chatlist";
import { useGame } from "@/context/game/game-provider";
import { useSocket } from "@/context/socket/socket-provider";


export default function Lobby(): React.JSX.Element {
  const { code } = useParams();
  const socket = useSocket();
  const { members, myUser } = useGame();
  useEffect(() => {
    console.log(myUser);
  }, [myUser]);
  
  const startGame = () => {
    socket?.emitWithAck(WebsocketEvent.START_GAME)
      .then((response) => {
        if (response && response.error) {
          toast.error(response.error as ToastContent<string>);
          return false;
        }
        return true;
      })
      .catch((error: Error) => {
        console.error(error);
      });;
  };

  const copyToClipboard = () => {
    if (!code) {
      return;
    }
    navigator.clipboard.writeText(code)
      .then(() => toast.success("Code copié dans le presse-papiers !"))
      .catch(() => toast.error("Erreur lors de la copie"));
  };

  return (
    <div>
      <div className="w-full h-screen grid grid-cols-4 grid-rows-5 gap-4">

        <div className="col-span-1 row-span-5">
          <div className="ml-4 mt-4 flex flex-col gap-2 items-center">
            <h2 className="my-8 it">Liste des Joueurs</h2>
            {members?.map((element: UserSocket, index: number) => (
              <div className="w-full flex justify-between items-center h-20 p-5 bg-gray-100 rounded-md shadow-md">
                <p className="font-bold" key={index}>{element.username}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-start-4 row-span-4">
          <Chatlist />
        </div>

        <div className=" grid col-start-2 col-span-2 row-start-1 row-span-4">
          <div className="flex flex-col justify-center items-center gap-4">
            <div>Code de la room :</div>
            <div
              className="cursor-pointer px-4 py-2 bg-gray-200 text-lg font-semibold rounded-md shadow-md hover:bg-gray-300 transition"
              onClick={copyToClipboard}
            >
              {code}
            </div>
            {myUser?.isHost ? (
              <button className="m-3 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out hover:bg-blue-600" onClick={startGame}>Lancer la partie</button>
            ):
              <div className="m-3 px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md size-fit">En attente de l'hôte pour lancer la partie</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
