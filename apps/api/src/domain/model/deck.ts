import { type Card, CardType, Connection, Tool } from "@/domain/model/card";

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.createDeck();
  }

  private createDeck(): void {
    this.addCards(CardType.INSPECT, 6, []);
    this.addCards(CardType.COLLAPSE, 3, []);
    this.addBrokenToolCards(3, Tool.LANTERN); // Casse Lanterne
    this.addRepairToolCards(2, Tool.LANTERN); // Répare Lanterne
    this.addBrokenToolCards(3, Tool.CART); // Casse Chariot
    this.addRepairToolCards(2, Tool.CART); // Répare Chariot
    this.addBrokenToolCards(3, Tool.PICKAXE); // Casse Pioche
    this.addRepairToolCards(2, Tool.PICKAXE); // Répare Pioche
    this.addRepairDoubleCards(1, [Tool.PICKAXE, Tool.CART]); // Répare Pioche + Chariot
    this.addRepairDoubleCards(1, [Tool.PICKAXE, Tool.LANTERN]); // Répare Pioche + Lanterne
    this.addRepairDoubleCards(1, [Tool.LANTERN, Tool.CART]); // Répare Lanterne + Chariot
    
    this.addPathCards(4, [Connection.TOP, Connection.RIGHT]);
    this.addPathCards(5, [Connection.TOP, Connection.LEFT]);
    this.addPathCards(5, [Connection.TOP, Connection.RIGHT, Connection.BOTTOM, Connection.LEFT]);
    this.addPathCards(3, [Connection.TOP, Connection.BOTTOM]);
    this.addPathCards(5, [Connection.RIGHT, Connection.BOTTOM, Connection.LEFT]);
    this.addPathCards(4, [Connection.RIGHT, Connection.LEFT]);
    this.addPathCards(5, [Connection.TOP, Connection.RIGHT, Connection.LEFT]);
    
    this.addDeadEndCards(1, [Connection.TOP, Connection.RIGHT]);
    this.addDeadEndCards(1, [Connection.TOP, Connection.LEFT]);
    this.addDeadEndCards(1, [Connection.TOP, Connection.RIGHT, Connection.BOTTOM]);
    this.addDeadEndCards(1, [Connection.RIGHT, Connection.BOTTOM, Connection.LEFT]);
    this.addDeadEndCards(1, [Connection.TOP, Connection.BOTTOM]);
    this.addDeadEndCards(1, [Connection.RIGHT, Connection.LEFT]);
    this.addDeadEndCards(1, [Connection.TOP, Connection.RIGHT, Connection.BOTTOM, Connection.LEFT]);
    this.addDeadEndCards(1, [Connection.TOP]);
    this.addDeadEndCards(1, [Connection.RIGHT]);
  }

  private addCards(type: CardType, count: number, connections: Connection[]): void {
    for (let index = 0; index < count; index++) {
      this.cards.push({ x: 0, y: 0, type, connections, tools: [] });
    }
  }

  private addPathCards(count: number, connections: Connection[]): void {
    this.addCards(CardType.PATH, count, connections);
  }

  private addDeadEndCards(count: number, connections: Connection[]): void {
    this.addCards(CardType.DEADEND, count, connections);
  }

  private addBrokenToolCards(count: number, tool: Tool): void {
    for (let index = 0; index < count; index++) {
      this.cards.push({ x: 0, y: 0, type: CardType.BROKEN_TOOL, connections: [], tools: [tool] });
    }
  }

  private addRepairToolCards(count: number, tool: Tool): void {
    for (let index = 0; index < count; index++) {
      this.cards.push({ x: 0, y: 0, type: CardType.REPAIR_TOOL, connections: [], tools: [tool] });
    }
  }

  private addRepairDoubleCards(count: number, tools: Tool[]): void {
    for (let index = 0; index < count; index++) {
      this.cards.push({ x: 0, y: 0, type: CardType.REPAIR_DOUBLE, connections: [], tools });
    }
  }

  public getDeck(): Card[] {
    return this.cards;
  }
}