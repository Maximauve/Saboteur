import React from "react";

export default function Deck(): React.JSX.Element {
  
  return (
    <div className="flex flex-col m-2">
      <div className="w-12 h-20 border border-gray-300 rounded-sm shadow-md bg-white relative">
        <img
          src="/images/cards/back.png"
          className="w-full h-full rounded-sm"
        />
        <p>nombre de cartes</p>
      </div>
    </div>
  );
}