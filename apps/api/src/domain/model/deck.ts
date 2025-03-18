import { type Card, CardType, Connection, Tool } from "@/domain/model/card";

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.createDeck();
  }

  private createDeck(): void {
    this.addCards(CardType.INSPECT, 6, [], "inspect.png");
    this.addCards(CardType.COLLAPSE, 3, [], "collapse.png");
    this.addBrokenToolCards(3, Tool.LANTERN, "broken_lantern.png");
    this.addRepairToolCards(2, Tool.LANTERN, "repair_lantern.png");
    this.addBrokenToolCards(3, Tool.CART, "broken_cart.png");
    this.addRepairToolCards(2, Tool.CART, "repair_cart.png");
    this.addBrokenToolCards(3, Tool.PICKAXE, "broken_pickaxe.png");
    this.addRepairToolCards(2, Tool.PICKAXE, "repair_pickaxe.png");
    this.addRepairDoubleCards(1, [Tool.PICKAXE, Tool.CART], "repair_pickaxe_cart.png");
    this.addRepairDoubleCards(1, [Tool.PICKAXE, Tool.LANTERN], "repair_pickaxe_lantern.png");
    this.addRepairDoubleCards(1, [Tool.LANTERN, Tool.CART], "repair_lantern_cart.png");

    this.addPathCards(4, [Connection.TOP, Connection.RIGHT], "path_tr.png");
    this.addPathCards(5, [Connection.TOP, Connection.LEFT], "path_tl.png");
    this.addPathCards(5, [Connection.TOP, Connection.RIGHT, Connection.BOTTOM, Connection.LEFT], "path_all.png");
    this.addPathCards(3, [Connection.TOP, Connection.BOTTOM], "path_tb.png");
    this.addPathCards(5, [Connection.TOP, Connection.BOTTOM, Connection.LEFT], "path_tbl.png");
    this.addPathCards(4, [Connection.RIGHT, Connection.LEFT], "path_rl.png");
    this.addPathCards(5, [Connection.TOP, Connection.RIGHT, Connection.LEFT], "path_trl.png");

    this.addDeadEndCards(1, [Connection.TOP, Connection.RIGHT], "deadend_tr.png");
    this.addDeadEndCards(1, [Connection.TOP, Connection.LEFT], "deadend_tl.png");
    this.addDeadEndCards(1, [Connection.TOP, Connection.RIGHT, Connection.BOTTOM], "deadend_trb.png");
    this.addDeadEndCards(1, [Connection.RIGHT, Connection.BOTTOM, Connection.LEFT], "deadend_rbl.png");
    this.addDeadEndCards(1, [Connection.TOP, Connection.BOTTOM], "deadend_tb.png");
    this.addDeadEndCards(1, [Connection.RIGHT, Connection.LEFT], "deadend_rl.png");
    this.addDeadEndCards(1, [Connection.TOP, Connection.RIGHT, Connection.BOTTOM, Connection.LEFT], "deadend_all.png");
    this.addDeadEndCards(1, [Connection.TOP], "deadend_t.png");
    this.addDeadEndCards(1, [Connection.RIGHT], "deadend_r.png");

  }

  private addCards(type: CardType, count: number, connections: Connection[], imageUrl: string): void {
    for (let index = 0; index < count; index++) {
      this.cards.push({ id: crypto.randomUUID(), type, connections, tools: [], imageUrl });
    }
  }

  private addPathCards(count: number, connections: Connection[], imageUrl: string): void {
    this.addCards(CardType.PATH, count, connections, imageUrl);
  }

  private addDeadEndCards(count: number, connections: Connection[], imageUrl: string): void {
    this.addCards(CardType.DEADEND, count, connections, imageUrl);
  }

  private addBrokenToolCards(count: number, tool: Tool, imageUrl: string): void {
    for (let index = 0; index < count; index++) {
      this.cards.push({ id: crypto.randomUUID(), type: CardType.BROKEN_TOOL, connections: [], tools: [tool], imageUrl });
    }
  }

  private addRepairToolCards(count: number, tool: Tool, imageUrl: string): void {
    for (let index = 0; index < count; index++) {
      this.cards.push({ id: crypto.randomUUID(), type: CardType.REPAIR_TOOL, connections: [], tools: [tool], imageUrl });
    }
  }

  private addRepairDoubleCards(count: number, tools: Tool[], imageUrl: string): void {
    for (let index = 0; index < count; index++) {
      this.cards.push({ id: crypto.randomUUID(), type: CardType.REPAIR_DOUBLE, connections: [], tools, imageUrl });
    }
  }

  public getDeck(): Card[] {
    return this.cards;
  }
}
