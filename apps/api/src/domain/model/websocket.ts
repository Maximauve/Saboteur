
export enum WebsocketEvent {
  BOARD = "board",
  CHAT = "chat",
  DECK = "deck",
  GAME_IS_STARTED = "game",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  MEMBERS = "members",
  PLAY = "play",
  REMOVE_USER = "removeUser",
  SHOW_ROLE = "showRole",
  START_GAME = "startGame",
  USER = "user"
}

export class Message {
  timeSent: string;
  text: string;
}

export class ChatMessage extends Message {
  username: string;
  userId: string;
}
