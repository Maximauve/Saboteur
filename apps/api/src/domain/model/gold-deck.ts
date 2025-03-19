export class GoldDeck {

  private goldCards: number[] = [];

  constructor() {
    this.createGoldDeck();
  }

  private createGoldDeck(): void {
    this.goldCards.push(
      ...Array.from<number>({ length: 16 }).fill(1),
      ...Array.from<number>({ length: 8 }).fill(2),
      ...Array.from<number>({ length: 4 }).fill(3),
    );
  }

}