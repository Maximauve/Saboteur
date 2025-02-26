export enum WebsocketEvent {
  CHAT = "chat",
  GAME_IS_STARTED = "game",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  MEMBERS = "members",
  START_GAME = "startGame"
}

export class Message {
  timeSent: string;
  text: string;
}