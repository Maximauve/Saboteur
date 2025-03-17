import { type ILogger } from '@/domain/logger/logger.interface';
import { type Board } from '@/domain/model/board';
import { type Card, Connection } from '@/domain/model/card';

export class IsCardPlacementValidUseCases {
  constructor(private readonly logger: ILogger) {}

  execute(board: Board, position: {x: number, y: number}): boolean {
    if (board.grid[position.x][position.y] !== null) {
      // Il y a déjà une carte posée à cet emplacement
      return false;
    }

    const adjascentCards: Record<string, Card|null> = {
      top: board.grid[position.y + 1][position.x],
      bottom: board.grid[position.y - 1][position.x],
      left: board.grid[position.y][position.x - 1],
      right: board.grid[position.y][position.x + 1],
    };

    for (const place in adjascentCards) {
      if (adjascentCards[place] === undefined || adjascentCards === null) {
        delete adjascentCards[place];
      }
    }

    if (Object.values(adjascentCards).length === 0) {
      return false;
    }

    if (adjascentCards.left !== null && !adjascentCards.left.connections.includes(Connection.RIGHT)) {
      return false;
    }
    if (adjascentCards.right !== null && !adjascentCards.right.connections.includes(Connection.LEFT)) {
      return false;
    }
    if (adjascentCards.top !== null && !adjascentCards.top.connections.includes(Connection.BOTTOM)) {
      return false;
    }
    if (adjascentCards.bottom !== null && !adjascentCards.bottom.connections.includes(Connection.TOP)) {
      return false;
    }

    return true;
  }
}
