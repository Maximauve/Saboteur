import { type ILogger } from '@/domain/logger/logger.interface';
import { type Card, CardType, Connection, type ObjectiveCard } from '@/domain/model/card';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class GetCardsToRevealUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string): Promise<ObjectiveCard[]> {
    const round = await this.roomRepository.getRound(code);
    let cardsToFind: ObjectiveCard[] = [];
    const treasureCard = round.board.objectivePositions.find(object => object.type === 'TREASURE');
    if (!treasureCard) {
      return [];
    }
    cardsToFind.push(treasureCard);
    const coalCards = round.board.objectivePositions.filter(object => object.type === 'COAL');
    if (coalCards.length === 0 || coalCards.length > 2) {
      return [];
    }
    cardsToFind.push(...coalCards);

    cardsToFind = cardsToFind.filter(card => {
      const ids = round.revealedCards.map(revealedCard => revealedCard.id);
      return !ids.includes(card.id);
    });

    const cardsToReveal: ObjectiveCard[] = [];

    for(const element of cardsToFind) {
      if (this.bfs(round.board.grid, 2, 4, element.x, element.y)) {
        cardsToReveal.push(element);
      }
    }

    cardsToReveal.forEach(card => {
      let suffix = '';
      if (card.type === 'COAL') {
        suffix = '_' + card.connections[1].toLowerCase();
      }
      round.revealedCards.push(card);
      round.board.grid[card.y][card.x] = {
        ...card,
        type: CardType.END_REVEALED,
        imageUrl: `path_${card.type.toLowerCase()}${suffix}.png`,
        tools: []
      };
    });

    await this.roomRepository.setRound(code, round.index, [
      'board', JSON.stringify(round.board),
      'revealedCards', JSON.stringify(round.revealedCards),
    ]);

    return cardsToReveal;
  }

  private bfs(grid: (Card | null)[][], startX: number, startY: number, treasureX: number, treasureY: number): boolean {
    const queue: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);
  
    while (queue.length > 0) {
      const [currentX, currentY] = queue.shift()!;

      const currentCard = grid[currentY][currentX];
      if (!currentCard) {
        continue;
      }
    
      if (currentY === treasureX && currentX === treasureY) {
        return true;
      }
    
      if (this.canMoveTo(grid, currentCard, Connection.TOP, currentX, currentY - 1) && 
        !visited.has(`${currentX},${currentY - 1}`)) {
        queue.push([currentX, currentY - 1]);
        visited.add(`${currentX},${currentY - 1}`);
      }
    
      if (this.canMoveTo(grid, currentCard, Connection.RIGHT, currentX + 1, currentY) && 
        !visited.has(`${currentX + 1},${currentY}`)) {
        queue.push([currentX + 1, currentY]);
        visited.add(`${currentX + 1},${currentY}`);
      }
    
      if (this.canMoveTo(grid, currentCard, Connection.BOTTOM, currentX, currentY + 1) && 
        !visited.has(`${currentX},${currentY + 1}`)) {
        queue.push([currentX, currentY + 1]);
        visited.add(`${currentX},${currentY + 1}`);
      }
    
      if (this.canMoveTo(grid, currentCard, Connection.LEFT, currentX - 1, currentY) && 
        !visited.has(`${currentX - 1},${currentY}`)) {
        queue.push([currentX - 1, currentY]);
        visited.add(`${currentX - 1},${currentY}`);
      }
    }
  
    return false;
  }

  private canMoveTo(
    grid: (Card | null)[][],
    fromCard: Card,
    direction: Connection,
    toX: number,
    toY: number
  ): boolean {
    if (toY < 0 || toY >= grid.length || toX < 0 || toX >= grid[0].length) {
      return false;
    }
  
    const toCard = grid[toY][toX];
    if (!toCard) {
      return false;
    }
  
    if (!fromCard.connections.includes(direction)) {
      return false;
    }
  
    let oppositeDirection: Connection;
    switch (direction) {
      case Connection.BOTTOM: {
        oppositeDirection = Connection.TOP;
    
        break;
      }
      case Connection.RIGHT: {
        oppositeDirection = Connection.LEFT;
    
        break;
      }
      case Connection.TOP: {
        oppositeDirection = Connection.BOTTOM;
    
        break;
      }
      default: {
        oppositeDirection = Connection.RIGHT;
      }
    }

    return toCard.connections.includes(oppositeDirection);
  }

}
