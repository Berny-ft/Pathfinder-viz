import roadTile from '../assets/tiles/terrain/road.png';
import grassTile from '../assets/tiles/terrain/grass.png';
import waterTile from '../assets/tiles/terrain/water.png';
import mountainTile from '../assets/tiles/terrain/mountain.png';
import wallTile from '../assets/tiles/terrain/wall.png';

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

export const TERRAIN_TILES: Record<TerrainType, string> = {
    [TerrainType.Road]: roadTile,
    [TerrainType.Grass]: grassTile,
    [TerrainType.Water]: waterTile,
    [TerrainType.Mountain]: mountainTile,
    [TerrainType.Wall]: wallTile,
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