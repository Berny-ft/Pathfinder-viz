export enum TerrainType {
  Road = 'road',
  Grass = 'grass',
  Water = 'water',
  Mountain = 'mountain',
  Wall = 'wall',
}

export const TERRAIN_COSTS: Record<TerrainType, number> = {

    [TerrainType.Road] : 1,
    [TerrainType.Grass] : 2,
    [TerrainType.Water] : 6,
    [TerrainType.Mountain] : 10,
    [TerrainType.Wall] : Infinity
};


export interface NodeData {
  row: number;
  col: number;
  terrain: TerrainType;
  cost: number;
  isStart: boolean;
  isEnd: boolean;
  isObstacle: boolean;
  isVisited: boolean;
  isCurrent: boolean;
  isPath: boolean;
  previousNode: NodeData | null;
}