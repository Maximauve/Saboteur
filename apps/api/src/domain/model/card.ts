export class ObjectiveCard {
  id: string;
  type: "COAL" | "TREASURE";
  x: number;
  y: number;
  connections: Connection[];
  isFlipped?: boolean;
}

export class Card {
  id: string;
  type: CardType;
  connections: Connection[];
  tools: Tool[];
  imageUrl: string;
  isFlipped?: boolean;
}

export enum CardType {
  BROKEN_TOOL = "BROKEN_TOOL",
  COLLAPSE = "COLLAPSE",
  DEADEND = "DEADEND",
  END_HIDDEN = "END_HIDDEN",
  END_REVEALED = "END_REVEALED",
  INSPECT = "INSPECT",
  PATH = "PATH",
  REPAIR_DOUBLE = "REPAIR_DOUBLE",
  REPAIR_TOOL = "REPAIR_TOOL",
  START = "START"
}

export enum Connection {
  BOTTOM = "BOTTOM",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  TOP = "TOP"
}

export enum Tool {
  CART = "CART",
  LANTERN = "LANTERN",
  PICKAXE = "PICKAXE"
}
