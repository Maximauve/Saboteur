import { type Message, WebsocketEvent } from "@saboteur/api/src/domain/model/websocket";
import React, { Fragment, useState } from "react";

import { useGame } from "@/context/game/game-provider";
import { useSocket } from "@/context/socket/socket-provider";

export default function Chatlist(): React.JSX.Element {
  const socket = useSocket();
  const { messagesChat } = useGame();
  const [message, setMessage] = useState<string>("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (message.trim() !== "") {
      socket?.emit(WebsocketEvent.CHAT, { text: message, timeSent: new Date() });
      setMessage("");
    }
  };

  const formatTime = (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="content-end h-full p-4">
      <div className="overflow-y-auto max-h-[90%] mb-4 flex flex-col-reverse">
        <div className="flex flex-col">
          {messagesChat?.map((messageChat: Message, index: number) => (
            <div key={index} className={`mb-2 p-2 rounded
                ${messageChat.username ? '' : 'text-yellow-600 italic font-semibold'}
                `}
            >
              {messageChat.username && (
                <Fragment>
                  <span className="text-gray-500 text-xs mr-2">{formatTime(messageChat.timeSent)}</span>
                  <span className="font-bold mr-2">{messageChat.username}:</span>
                </Fragment>
              )}
              <span>{messageChat.text}</span>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          name="sendMessage"
          autoComplete="off"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="flex-grow p-2 border rounded"
          placeholder="Écrivez votre message..."
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={message.trim() === ""}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
