
export enum WebsocketEvent {
  BOARD = "board",
  CARDS = "cards",
  CHAT = "chat",
  DECK = "deck",
  GAME_IS_STARTED = "game",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  MEMBERS = "members",
  PLAY = "play",
  REMOVE_USER = "removeUser",
  START_GAME = "startGame",
}

export class Message {
  timeSent: string;
  text: string;
}

export class ChatMessage extends Message {
  username: string;
  userId: string;
}