import './Node.css';
import { TerrainType, TERRAIN_TILES } from '../constants/terrain';
import { TILE_WIDTH, tileTopLeft } from '../utils/grid';

interface NodeProps {
    row: number;
    col: number;
    isStart: boolean;
    isEnd: boolean;
    isObstacle: boolean;
    isCurrent: boolean;
    terrain: TerrainType;
    originX: number;
    onNodeClick: (row: number, col: number) => void;
}

const Node = ({ row, col, isStart, isEnd, isObstacle, isCurrent, terrain, originX, onNodeClick }: NodeProps) => {
    const tile = isObstacle ? TERRAIN_TILES[TerrainType.Wall] : TERRAIN_TILES[terrain];
    const startClassName = isStart ? 'node-start' : '';
    const endClassName = isEnd ? 'node-end' : '';
    const currentClassName = isCurrent ? 'node-current' : '';

    const { left, top } = tileTopLeft(row, col, originX);

    return (
        <div
            className={`node ${startClassName} ${endClassName} ${currentClassName}`}
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
            {(isStart || isEnd) && <div className="node-marker" />}
        </div>
    );
};

export default Node;
