import { type Board } from "@saboteur/api/src/domain/model/board";
import { type Card, CardType, Connection } from "@saboteur/api/src/domain/model/card";

export function isCardPlacementValid(card: Card, board: Board, position: {x: number, y: number}): boolean {
  const connections = card.isFlipped ? getFlippedConnections(card.connections) : card.connections;

  if (board.grid[position.x][position.y] !== null) {
    // Il y a déjà une carte posée à cet emplacement
    return false;
  }

  const adjascentCards: Record<string, Card|null> = {
    top: board.grid[position.x - 1] ? board.grid[position.x - 1][position.y] : null,
    bottom: board.grid[position.x + 1] ? board.grid[position.x + 1][position.y] : null,
    left: board.grid[position.x] ? board.grid[position.x][position.y - 1] : null,
    right:board.grid[position.x] ?  board.grid[position.x][position.y + 1] : null,
  };

  for (const place in adjascentCards) {
    if (adjascentCards[place] === undefined || adjascentCards[place] === null || adjascentCards[place]?.type === CardType.END_HIDDEN) {
      delete adjascentCards[place];
    }
  }

  if (Object.values(adjascentCards).length === 0) {
    // pas possible de poser une carte au milieu de rien
    return false;
  }

  let directLink = false;
  // il faut que soit les deux ne se lient pas, soit les deux se lient
  if (adjascentCards.left) {
    if (connections.includes(Connection.LEFT) && !adjascentCards.left.connections.includes(Connection.RIGHT)) {
      return false;
    }
    if (!connections.includes(Connection.LEFT) && adjascentCards.left.connections.includes(Connection.RIGHT)) {
      return false;
    }
    if (connections.includes(Connection.LEFT) && adjascentCards.left.connections.includes(Connection.RIGHT)) {
      directLink = true;
    }
  }
  if (adjascentCards.right) {
    if (connections.includes(Connection.RIGHT) && !adjascentCards.right.connections.includes(Connection.LEFT)) {
      return false;
    }
    if (!connections.includes(Connection.RIGHT) && adjascentCards.right.connections.includes(Connection.LEFT)) {
      return false;
    }
    if (connections.includes(Connection.RIGHT) && adjascentCards.right.connections.includes(Connection.LEFT)) {
      directLink = true;
    }
  }
  if (adjascentCards.top) {
    if (connections.includes(Connection.TOP) && !adjascentCards.top.connections.includes(Connection.BOTTOM)) {
      return false;
    }
    if (!connections.includes(Connection.TOP) && adjascentCards.top.connections.includes(Connection.BOTTOM)) {
      return false;
    }
    if (connections.includes(Connection.TOP) && adjascentCards.top.connections.includes(Connection.BOTTOM)) {
      directLink = true;
    }
  }
  if (adjascentCards.bottom) {
    if (connections.includes(Connection.BOTTOM) && !adjascentCards.bottom.connections.includes(Connection.TOP)) {
      return false;
    }
    if (!connections.includes(Connection.BOTTOM) && adjascentCards.bottom.connections.includes(Connection.TOP)) {
      return false;
    }
    if (connections.includes(Connection.BOTTOM) && adjascentCards.bottom.connections.includes(Connection.TOP)) {
      directLink = true;
    }
  }
  return directLink;
}


export function getFlippedConnections(connections: Connection[]): Connection[] {
  return connections.map(connection => {
    switch (connection) {
      case Connection.BOTTOM: {
        return Connection.TOP;
      }
      case Connection.LEFT: {
        return Connection.RIGHT;
      }
      case Connection.RIGHT: {
        return Connection.LEFT;
      }
      case Connection.TOP: {
        return Connection.BOTTOM;
      }
    }
  });
}
