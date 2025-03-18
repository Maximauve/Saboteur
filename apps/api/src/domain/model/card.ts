export class ObjectiveCard {
  type: "STONE" | "TREASURE";
}

export class Card {
  id: string;
  type: CardType;
  connections: Connection[];
  tools: Tool[];
  imageUrl: string;
}

export enum CardType {
  BROKEN_TOOL = "BROKEN_TOOL",
  COLLAPSE = "COLLAPSE",
  DEADEND = "DEADEND",
  END_HIDDEN = "END_HIDDEN",
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