import {NodeData, TerrainType, TERRAIN_COSTS} from '../constants/terrain';

export interface GridPosition {
  row: number;
  col: number;
}

export function createInitialGrid(
  rows: number,
  cols: number,
  startPos: GridPosition,
  endPos: GridPosition
): NodeData[][] {
  const grid: NodeData[][] = [];
  for (let r = 0; r < rows; r++) {
    const currentRow: NodeData[] = [];
    for (let c = 0; c < cols; c++) {

        const isStart = r === startPos.row && c === startPos.col;
        const isEnd = r === endPos.row && c === endPos.col;

        const node : NodeData = {
            row : r,
            col : c,
            terrain : TerrainType.Road,
            cost: TERRAIN_COSTS[TerrainType.Road],
            isStart,
            isEnd,
            isObstacle: false,
            isVisited: false,
            isCurrent: false,
            isPath: false,
            previousNode: null,
        }

        currentRow.push(node);
    }
    grid.push(currentRow);
  }
  return grid;
}


export function getNewGridWithTerrain(
  grid: NodeData[][],
  row: number,
  col: number,
  newTerrain: TerrainType
): NodeData[][] {
  const newGrid = grid.slice();
  const node = newGrid[row][col];

  const updatedNode: NodeData = {
    ...node,
    terrain: newTerrain,
    cost: TERRAIN_COSTS[newTerrain],
  };

  const newRow = newGrid[row].slice();
  newRow[col] = updatedNode;
  newGrid[row] = newRow;

  return newGrid;
}

export function resetNodeStates(grid: NodeData[][]): NodeData[][] {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      isVisited: false,
      isCurrent: false,
      isPath: false,
      previousNode: null,
    }))
  );
}

export function reconstructPath(endNode: NodeData): GridPosition[] {
  const path: GridPosition[] = [];
  let current: NodeData | null = endNode;
  while (current) {
    path.unshift({ row: current.row, col: current.col });
    current = current.previousNode;
  }
  return path;
}

export function getNeighbors(
  node: NodeData,
  grid: NodeData[][],
  allowDiagonal: boolean = false
): NodeData[] {
  const neighbors: NodeData[] = [];
  const { row, col } = node;
  const numRows = grid.length;
  const numCols = grid[0].length;

  const directions = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
  ];

  if (allowDiagonal) {
    directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  }

  for (const [dr, dc] of directions) {
    const r = row + dr;
    const c = col + dc;

    if (r >= 0 && r < numRows && c >= 0 && c < numCols) {
      neighbors.push(grid[r][c]);
    }
  }

  return neighbors;
}
