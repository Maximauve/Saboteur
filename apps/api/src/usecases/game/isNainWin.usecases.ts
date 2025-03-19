import { type ILogger } from '@/domain/logger/logger.interface';
import { type Card, Connection, type ObjectiveCard } from '@/domain/model/card';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class IsNainWinUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string): Promise<boolean> {
    const round = await this.roomRepository.getRound(code);
    return hasPathToTreasure(round.board.grid, round.board.objectivePositions);
  }
}

function hasPathToTreasure(
  grid: (Card | null)[][],
  objectivePositions: ObjectiveCard[]
): boolean {
  const treasurePosition = objectivePositions.find(object => object.type === 'TREASURE');
  if (!treasurePosition) {
    return false;
  }

  return bfs(grid, 2, 4, treasurePosition.x, treasurePosition.y);
}

function bfs(grid: (Card | null)[][], startX: number, startY: number, treasureX: number, treasureY: number): boolean {
  const queue: [number, number][] = [[startX, startY]];
  const visited = new Set<string>();
  visited.add(`${startX},${startY}`);
  
  while (queue.length > 0) {
    const [currentX, currentY] = queue.shift()!;
        
    if (currentY === treasureX && currentX === treasureY) {
      return true;
    }
    
    const currentCard = grid[currentY][currentX];
    if (!currentCard) {
      continue;
    }
    
    if (canMoveTo(grid, currentCard, Connection.TOP, currentX, currentY - 1) && 
        !visited.has(`${currentX},${currentY - 1}`)) {
      queue.push([currentX, currentY - 1]);
      visited.add(`${currentX},${currentY - 1}`);
    }
    
    if (canMoveTo(grid, currentCard, Connection.RIGHT, currentX + 1, currentY) && 
        !visited.has(`${currentX + 1},${currentY}`)) {
      queue.push([currentX + 1, currentY]);
      visited.add(`${currentX + 1},${currentY}`);
    }
    
    if (canMoveTo(grid, currentCard, Connection.BOTTOM, currentX, currentY + 1) && 
        !visited.has(`${currentX},${currentY + 1}`)) {
      queue.push([currentX, currentY + 1]);
      visited.add(`${currentX},${currentY + 1}`);
    }
    
    if (canMoveTo(grid, currentCard, Connection.LEFT, currentX - 1, currentY) && 
        !visited.has(`${currentX - 1},${currentY}`)) {
      queue.push([currentX - 1, currentY]);
      visited.add(`${currentX - 1},${currentY}`);
    }
  }
  
  return false;
}

function canMoveTo(
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
  
  const oppositeDirection: Connection = 
    direction === Connection.TOP ? Connection.BOTTOM :
      direction === Connection.RIGHT ? Connection.LEFT :
        // eslint-disable-next-line unicorn/no-nested-ternary
        direction === Connection.BOTTOM ? Connection.TOP : Connection.RIGHT;

  return toCard.connections.includes(oppositeDirection);
}
