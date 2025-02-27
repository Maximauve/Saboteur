export enum WebsocketEvent {
  CARDS = "cards",
  CHAT = "chat",
  GAME_IS_STARTED = "game",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  MEMBERS = "members",
  REMOVE_USER = "removeUser",
  START_GAME = "startGame",
}

export class Message {
  timeSent: string;
  text: string;
}