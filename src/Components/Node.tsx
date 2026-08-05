import './Node.css';
import { TerrainType } from '../constants/terrain';

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
    onNodeClick: (row: number, col: number) => void;
}

const Node = ({ row, col, isStart, isEnd, isObstacle, isVisited, isCurrent, isPath, terrain, onNodeClick }: NodeProps) => {
    const startClassName = isStart ? 'node-start' : '';
    const endClassName = isEnd ? 'node-end' : '';
    const terrainClassName = isObstacle ? 'node-obs' : `node-terrain-${terrain}`;
    const visitedClassName = isVisited ? 'node-visited' : '';
    const currentClassName = isCurrent ? 'node-current' : '';
    const pathClassName = isPath ? 'node-shortest-path' : '';

    return (
        <div
            className={`node ${terrainClassName} ${startClassName} ${endClassName} ${visitedClassName} ${currentClassName} ${pathClassName}`}
            onClick={() => onNodeClick(row, col)}
        ></div>
    );
};

export default Node;
