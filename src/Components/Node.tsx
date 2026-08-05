import './Node.css';
import { TerrainType, TERRAIN_TILES } from '../constants/terrain';

export const TILE_WIDTH = 48;
export const TILE_HEIGHT = 24;

interface NodeProps {
    row: number;
    col: number;
    isStart: boolean;
    isEnd: boolean;
    isObstacle: boolean;
    isVisited: boolean;
    isCurrent: boolean;
    isPath: boolean;
    terrain: TerrainType;
    originX: number;
    onNodeClick: (row: number, col: number) => void;
}

const Node = ({ row, col, isStart, isEnd, isObstacle, isVisited, isCurrent, isPath, terrain, originX, onNodeClick }: NodeProps) => {
    const tile = isObstacle ? TERRAIN_TILES[TerrainType.Wall] : TERRAIN_TILES[terrain];
    const startClassName = isStart ? 'node-start' : '';
    const endClassName = isEnd ? 'node-end' : '';
    const visitedClassName = isVisited ? 'node-visited' : '';
    const currentClassName = isCurrent ? 'node-current' : '';
    const pathClassName = isPath ? 'node-shortest-path' : '';

    const left = originX + (col - row) * (TILE_WIDTH / 2);
    const top = (col + row) * (TILE_HEIGHT / 2);

    return (
        <div
            className={`node ${startClassName} ${endClassName} ${visitedClassName} ${currentClassName} ${pathClassName}`}
            style={{
                left,
                top,
                width: TILE_WIDTH,
                height: TILE_WIDTH,
                backgroundImage: `url(${tile})`,
            }}
            onClick={() => onNodeClick(row, col)}
        >
            <div className="node-overlay" />
        </div>
    );
};

export default Node;
