import { useEffect, useRef, useState } from 'react'

import Node from "./Node.tsx";

import './Grid.css'

import { TerrainType, TERRAIN_COSTS, NodeData } from '../constants/terrain.ts';
import { reconstructPath, TILE_WIDTH, TILE_HEIGHT, tileCenter } from '../utils/grid.ts';

const ROWS = 20;
const COLS = 20;

interface Position {
    row: number;
    col: number;
}

export interface RunResult {
    grid: NodeData[][];
    startNode: Position;
    endNode: Position;
    isBidirectional: boolean;
}

interface GridProps {
    setStartChoice: boolean;
    setEndChoice: boolean;
    setObs: boolean;
    activeTerrain: TerrainType;
    setRun: number;
    setSearchType: string;
    resetGrid: boolean;
    maze: boolean;
    speed: number;
    onRunComplete: (result: RunResult) => void;
}

function initializeGrid(): NodeData[][] {
    const grid: NodeData[][] = [];

    for (let row = 0; row < ROWS; row++) {
        const CurrentRow: NodeData[] = [];
        for (let col = 0; col < COLS; col++) {
            CurrentRow.push({
                row, col,
                isStart: false,
                isEnd: false,
                isObstacle: false,
                isVisited: false,
                isCurrent: false,
                isPath: false,
                previousNode: null,
                visitOrder: null,
                terrain: TerrainType.Road,
                cost: TERRAIN_COSTS[TerrainType.Road],
            });
        }
        grid.push(CurrentRow);
    }

    return grid;
}

const Grid = ({ setStartChoice, setEndChoice, setObs, activeTerrain = TerrainType.Wall, setRun, setSearchType, resetGrid, maze, speed, onRunComplete }: GridProps) => {
    const [grid, setGrid] = useState<NodeData[][]>([]);
    const [startNode, setStartNode] = useState<Position>({ row: null as unknown as number, col: null as unknown as number });
    const [endNode, setEndNode] = useState<Position>({ row: null as unknown as number, col: null as unknown as number });
    const [obstacleCount, setObstacleCount] = useState(0);
    const [status, setStatus] = useState('');
    const runIdRef = useRef(0);

    useEffect(() => {
        setGrid(initializeGrid());
    }, [])

    useEffect(() => {
        setGrid(initializeGrid());
        setStartNode({ row: null as unknown as number, col: null as unknown as number });
        setEndNode({ row: null as unknown as number, col: null as unknown as number });
        setObstacleCount(0);
        setStatus('');
    }, [resetGrid]);

    useEffect(() => {
        if (maze) {
            mazeDFS();
        }
    }, [maze]);

    function mazeDFS() {
        const tempGrid: NodeData[][] = grid.map(r => r.slice().map(node => ({
            ...node,
            isStart: false,
            isEnd: false,
            isObstacle: true,
            isVisited: false,
            isCurrent: false,
            isPath: false,
            previousNode: null,
            visitOrder: null,
            terrain: TerrainType.Road,
            cost: TERRAIN_COSTS[TerrainType.Road],
        })));

        let row = Math.floor(ROWS / 2);
        let col = Math.floor(COLS / 2);

        const MIN = 0;
        const MAXROWS = ROWS - 1;
        const MAXCOLS = COLS - 1;
        const boundsCheckUp = (row: number) => row - 1 >= MIN;
        const boundsCheckDown = (row: number) => row + 1 <= MAXROWS;
        const boundsCheckRight = (col: number) => col + 1 <= MAXCOLS;
        const boundsCheckLeft = (col: number) => col - 1 >= MIN;

        const countExploredNeighbors = (r: number, c: number) => {
            let count = 0;
            if (boundsCheckUp(r) && tempGrid[r - 1][c].isVisited) count++;
            if (boundsCheckDown(r) && tempGrid[r + 1][c].isVisited) count++;
            if (boundsCheckLeft(c) && tempGrid[r][c - 1].isVisited) count++;
            if (boundsCheckRight(c) && tempGrid[r][c + 1].isVisited) count++;
            return count;
        };

        tempGrid[row][col].isObstacle = false;
        tempGrid[row][col].isVisited = true;

        let options = [0, 1, 2, 3];

        while (true) {
            if (options.length === 0) {
                if (tempGrid[row][col].previousNode === null) {
                    break;
                }

                const prevNode = tempGrid[row][col].previousNode!;
                row = prevNode.row;
                col = prevNode.col;
                options = [0, 1, 2, 3];
                continue;
            }

            const randIdx = Math.floor(Math.random() * options.length);
            const choice = options[randIdx];
            let moved = false;

            if (choice === 0) { // UP
                if (boundsCheckUp(row) &&
                    !tempGrid[row - 1][col].isVisited &&
                    countExploredNeighbors(row - 1, col) === 1) {

                    row--;
                    tempGrid[row][col].isObstacle = false;
                    tempGrid[row][col].isVisited = true;
                    tempGrid[row][col].previousNode = tempGrid[row + 1][col];
                    options = [0, 1, 2, 3];
                    moved = true;
                }
            } else if (choice === 1) { // RIGHT
                if (boundsCheckRight(col) &&
                    !tempGrid[row][col + 1].isVisited &&
                    countExploredNeighbors(row, col + 1) === 1) {

                    col++;
                    tempGrid[row][col].isObstacle = false;
                    tempGrid[row][col].isVisited = true;
                    tempGrid[row][col].previousNode = tempGrid[row][col - 1];
                    options = [0, 1, 2, 3];
                    moved = true;
                }
            } else if (choice === 2) { // DOWN
                if (boundsCheckDown(row) &&
                    !tempGrid[row + 1][col].isVisited &&
                    countExploredNeighbors(row + 1, col) === 1) {

                    row++;
                    tempGrid[row][col].isObstacle = false;
                    tempGrid[row][col].isVisited = true;
                    tempGrid[row][col].previousNode = tempGrid[row - 1][col];
                    options = [0, 1, 2, 3];
                    moved = true;
                }
            } else if (choice === 3) { // LEFT
                if (boundsCheckLeft(col) &&
                    !tempGrid[row][col - 1].isVisited &&
                    countExploredNeighbors(row, col - 1) === 1) {

                    col--;
                    tempGrid[row][col].isObstacle = false;
                    tempGrid[row][col].isVisited = true;
                    tempGrid[row][col].previousNode = tempGrid[row][col + 1];
                    options = [0, 1, 2, 3];
                    moved = true;
                }
            }

            if (!moved) {
                options.splice(randIdx, 1);
            }
        }

        // weighted algorithms (Dijkstra/A*/Greedy) need loops and varied
        // terrain cost to have anything to route around; unweighted
        // algorithms (DFS/BFS/BiBFS) get the plain perfect maze as-is
        const isWeightedAlgorithm = setSearchType === 'Dijkstra' || setSearchType === 'AStar' || setSearchType === 'Greedy';

        if (isWeightedAlgorithm) {
            // braid the maze: knock down some walls between adjacent passages
            // so loops exist, otherwise there's only ever one path
            const BRAID_CHANCE = 0.12;
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (tempGrid[r][c].isObstacle) continue;
                    if (boundsCheckRight(c) && tempGrid[r][c + 1].isObstacle && Math.random() < BRAID_CHANCE) {
                        tempGrid[r][c + 1].isObstacle = false;
                    }
                    if (boundsCheckDown(r) && tempGrid[r + 1][c].isObstacle && Math.random() < BRAID_CHANCE) {
                        tempGrid[r + 1][c].isObstacle = false;
                    }
                }
            }

            // scatter weighted terrain across passable cells so weighted
            // algorithms have costs to actually optimize against
            const TERRAIN_CHOICES = [TerrainType.Grass, TerrainType.Water, TerrainType.Mountain];
            const TERRAIN_CHANCE = 0.35;
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const node = tempGrid[r][c];
                    if (node.isObstacle) continue;
                    if (Math.random() < TERRAIN_CHANCE) {
                        const terrain = TERRAIN_CHOICES[Math.floor(Math.random() * TERRAIN_CHOICES.length)];
                        node.terrain = terrain;
                        node.cost = TERRAIN_COSTS[terrain];
                    }
                }
            }
        }

        const finalGrid = tempGrid.map(r => r.slice().map(node => ({
            ...node,
            isVisited: false
        })));

        if (startNode.row !== null) {
            const start = finalGrid[startNode.row][startNode.col];
            start.isStart = true;
            start.isObstacle = false;
            start.terrain = TerrainType.Road;
            start.cost = TERRAIN_COSTS[TerrainType.Road];
        }
        if (endNode.row !== null) {
            const end = finalGrid[endNode.row][endNode.col];
            end.isEnd = true;
            end.isObstacle = false;
            end.terrain = TerrainType.Road;
            end.cost = TERRAIN_COSTS[TerrainType.Road];
        }

        const newObstacleCount = finalGrid.reduce(
            (sum, gridRow) => sum + gridRow.filter(node => node.isObstacle).length,
            0
        );
        setObstacleCount(newObstacleCount);

        setGrid(finalGrid);
    }

    function HandleNodeClick(row: number, col: number) {
        if (setStartChoice) {
            const newGrid = grid.map(gridRow => gridRow.slice());

            if (startNode.row != null) {
                const prevStartNode = newGrid[startNode.row][startNode.col]
                prevStartNode.isStart = false;
                prevStartNode.isVisited = false;
            }

            const clickedNode = newGrid[row][col]
            clickedNode.isVisited = true;
            clickedNode.isStart = true;

            setStartNode({ row, col })
            setGrid(newGrid)
        } else if (setEndChoice) {
            const newGrid = grid.map(gridRow => gridRow.slice())

            if (endNode.row != null) {
                const prevEndNode = newGrid[endNode.row][endNode.col]
                prevEndNode.isEnd = false;
            }

            const clickedNode = newGrid[row][col]
            clickedNode.isEnd = true;
            setEndNode({ row, col })
            setGrid(newGrid)
        } else if (setObs) {
            if ((row === startNode.row && col === startNode.col) || (row === endNode.row && col === endNode.col)) {
                return;
            }

            const newGrid = grid.map(gridRow => gridRow.slice());
            const clickedNode = newGrid[row][col];
            const isSameTerrain = clickedNode.terrain === activeTerrain;
            const wasObstacle = clickedNode.isObstacle;

            if (isSameTerrain) {
                clickedNode.isObstacle = false;
                clickedNode.terrain = TerrainType.Road;
                clickedNode.cost = TERRAIN_COSTS[TerrainType.Road];
            } else {
                clickedNode.terrain = activeTerrain;
                clickedNode.cost = TERRAIN_COSTS[activeTerrain];
                clickedNode.isObstacle = activeTerrain === TerrainType.Wall;
            }

            if (clickedNode.isObstacle !== wasObstacle) {
                setObstacleCount(count => count + (clickedNode.isObstacle ? 1 : -1));
            }

            setGrid(newGrid);
        }
    }

    function clearSearchState(sourceGrid: NodeData[][]): NodeData[][] {
        return sourceGrid.map(row => row.map(node => ({
            ...node,
            isVisited: node.isStart,
            isCurrent: false,
            isPath: false,
            previousNode: null,
            visitOrder: node.isStart ? 1 : null,
        })));
    }

    useEffect(() => {
        if (startNode.row !== null && endNode.row !== null) {
            if (setRun) {
                const myRunId = ++runIdRef.current;
                setStatus('');
                const clearedGrid = clearSearchState(grid);
                setGrid(clearedGrid);
                if (setSearchType === 'DFS') {
                    DFS(clearedGrid, myRunId)
                } else if (setSearchType === 'BFS') {
                    BFS(clearedGrid, myRunId)
                } else if (setSearchType === 'Dijkstra') {
                    Dijkstra(clearedGrid, myRunId)
                } else if (setSearchType === 'AStar') {
                    AStar(clearedGrid, myRunId)
                } else if (setSearchType === 'Greedy') {
                    Greedy(clearedGrid, myRunId)
                } else if (setSearchType === 'BiBFS') {
                    BidirectionalBFS(clearedGrid, myRunId)
                }
            }
        }
    }, [setRun]);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    function finishRun(finalGrid: NodeData[][], runId: number, isBidirectional = false) {
        if (runIdRef.current !== runId) return;
        onRunComplete({ grid: finalGrid, startNode, endNode, isBidirectional });
    }

    async function revealPath(endNodeData: NodeData, runId: number, sourceGrid: NodeData[][]): Promise<NodeData[][]> {
        const path = reconstructPath(endNodeData);
        let workingGrid = sourceGrid;
        for (const { row, col } of path) {
            if (runIdRef.current !== runId) return workingGrid;
            workingGrid = workingGrid.map(r => r.slice());
            workingGrid[row][col] = { ...workingGrid[row][col], isPath: true, isCurrent: false };
            setGrid(workingGrid);
            await delay(speed);
        }
        return workingGrid;
    }

    async function DFS(initialGrid: NodeData[][], runId: number) {
        let row = startNode.row;
        let col = startNode.col;

        const MIN = 0
        const MAXROWS = ROWS - 1
        const MAXCOLS = COLS - 1

        let cnt = 1
        let workingGrid = initialGrid.map(gridRow => gridRow.slice());
        while (true) {
            if (runIdRef.current !== runId) return;
            const prevRow = row;
            const prevCol = col;

            const visitedLog = workingGrid.map(gridRow => gridRow.slice());
            visitedLog[prevRow][prevCol].isCurrent = false;

            const boundsCheckUp = MAXROWS >= row - 1 && row - 1 >= MIN && MAXCOLS >= col && col >= MIN
            const boundsCheckDown = MAXROWS >= row + 1 && row + 1 >= MIN && MAXCOLS >= col && col >= MIN
            const boundsCheckRight = MAXROWS >= row && row >= MIN && MAXCOLS >= col + 1 && col + 1 >= MIN
            const boundsCheckLeft = MAXROWS >= row && row >= MIN && MAXCOLS >= col - 1 && col - 1 >= MIN
            if (endNode.row === row && endNode.col === col) {
                visitedLog[row][col].isVisited = true;
                visitedLog[row][col].isCurrent = false;
                setGrid(visitedLog);
                setStatus(`Solved: explored ${cnt}/${ROWS * COLS - obstacleCount - 2} nodes`);
                const finalGrid = await revealPath(visitedLog[row][col], runId, visitedLog);
                finishRun(finalGrid, runId);
                break;
            } else if (boundsCheckUp && !visitedLog[row - 1][col].isObstacle && !visitedLog[row - 1][col].isVisited) {
                cnt++;
                row = row - 1
                visitedLog[row][col].isVisited = true
                visitedLog[row][col].isCurrent = true
                visitedLog[row][col].previousNode = visitedLog[prevRow][prevCol]
                visitedLog[row][col].visitOrder = cnt
            } else if (boundsCheckRight && !visitedLog[row][col + 1].isObstacle && !visitedLog[row][col + 1].isVisited) {
                cnt++
                col = col + 1
                visitedLog[row][col].isVisited = true
                visitedLog[row][col].isCurrent = true
                visitedLog[row][col].previousNode = visitedLog[prevRow][prevCol]
                visitedLog[row][col].visitOrder = cnt
            } else if (boundsCheckDown && !visitedLog[row + 1][col].isObstacle && !visitedLog[row + 1][col].isVisited) {
                cnt++
                row = row + 1
                visitedLog[row][col].isVisited = true
                visitedLog[row][col].isCurrent = true
                visitedLog[row][col].previousNode = visitedLog[prevRow][prevCol]
                visitedLog[row][col].visitOrder = cnt
            } else if (boundsCheckLeft && !visitedLog[row][col - 1].isObstacle && !visitedLog[row][col - 1].isVisited) {
                cnt++
                col = col - 1
                visitedLog[row][col].isVisited = true
                visitedLog[row][col].isCurrent = true
                visitedLog[row][col].previousNode = visitedLog[prevRow][prevCol]
                visitedLog[row][col].visitOrder = cnt
            } else if (!visitedLog[row][col].previousNode) {
                setStatus(`No solution found: explored ${cnt}/${ROWS * COLS - obstacleCount - 2} nodes`);
                finishRun(visitedLog, runId);
                break;
            } else {
                const prev = visitedLog[row][col].previousNode!;
                row = prev.row;
                col = prev.col;
            }

            workingGrid = visitedLog;
            setGrid(visitedLog)
            await delay(speed);
        }
    }

    async function BFS(initialGrid: NodeData[][], runId: number) {
        const MIN = 0
        const MAXROWS = ROWS - 1
        const MAXCOLS = COLS - 1

        let cnt = 1;
        let prevCurrent: Position | null = null;
        let workingGrid = initialGrid.map(r => r.slice());

        const queue: Position[] = [{ row: startNode.row, col: startNode.col }]
        while (queue.length !== 0) {
            if (runIdRef.current !== runId) return;
            const visitedLog = workingGrid.map(r => r.slice())

            if (prevCurrent) {
                visitedLog[prevCurrent.row][prevCurrent.col].isCurrent = false;
            }

            const first = queue.shift()!;
            visitedLog[first.row][first.col].isCurrent = true;
            prevCurrent = { row: first.row, col: first.col };

            const neighbors: [number, number][] = [
                [first.row - 1, first.col],
                [first.row + 1, first.col],
                [first.row, first.col + 1],
                [first.row, first.col - 1],
            ];

            for (const [r, c] of neighbors) {
                if (MAXROWS >= r && r >= MIN && MAXCOLS >= c && c >= MIN && !visitedLog[r][c].isVisited && !visitedLog[r][c].isObstacle) {
                    visitedLog[r][c].isVisited = true;
                    visitedLog[r][c].previousNode = visitedLog[first.row][first.col];
                    cnt++;
                    visitedLog[r][c].visitOrder = cnt;
                    if (r === endNode.row && c === endNode.col) {
                        setGrid(visitedLog);
                        setStatus(`Solved: explored ${cnt}/${ROWS * COLS - obstacleCount - 2} nodes`);
                        const finalGrid = await revealPath(visitedLog[r][c], runId, visitedLog);
                        finishRun(finalGrid, runId);
                        return;
                    }
                    queue.push({ row: r, col: c });
                }
            }

            workingGrid = visitedLog;
            setGrid(visitedLog)
            await delay(speed);
        }

        if (runIdRef.current !== runId) return;
        setStatus(`No solution found: explored ${cnt}/${ROWS * COLS - obstacleCount - 2} nodes`);
        finishRun(workingGrid, runId);
    }

    function neighborsOf(row: number, col: number): Position[] {
        const MIN = 0, MAXROWS = ROWS - 1, MAXCOLS = COLS - 1;
        const candidates: Position[] = [
            { row: row - 1, col }, { row: row + 1, col },
            { row, col: col + 1 }, { row, col: col - 1 },
        ];
        return candidates.filter(({ row: r, col: c }) => r >= MIN && r <= MAXROWS && c >= MIN && c <= MAXCOLS);
    }

    // shared weighted search (Dijkstra when heuristic is absent, A* / Greedy when present)
    async function weightedSearch(initialGrid: NodeData[][], useGScore: boolean, runId: number, heuristic?: (r: number, c: number) => number) {
        let cnt = 1;
        let settledCount = 1;
        const dist = new Map<string, number>();
        const key = (r: number, c: number) => `${r},${c}`;
        const settled = new Set<string>();
        dist.set(key(startNode.row, startNode.col), 0);

        type QueueItem = { row: number; col: number; priority: number };
        const queue: QueueItem[] = [{ row: startNode.row, col: startNode.col, priority: 0 }];

        let workingGrid = initialGrid.map(r => r.slice());
        let prevCurrent: Position | null = null;

        while (queue.length !== 0) {
            if (runIdRef.current !== runId) return;
            queue.sort((a, b) => a.priority - b.priority);
            const current = queue.shift()!;
            const currentKey = key(current.row, current.col);

            if (settled.has(currentKey)) continue;
            settled.add(currentKey);

            const visitedLog = workingGrid.map(r => r.slice());
            if (prevCurrent) {
                visitedLog[prevCurrent.row][prevCurrent.col].isCurrent = false;
            }
            visitedLog[current.row][current.col].isVisited = true;
            visitedLog[current.row][current.col].isCurrent = true;
            if (!(current.row === startNode.row && current.col === startNode.col)) {
                settledCount++;
                visitedLog[current.row][current.col].visitOrder = settledCount;
            }
            prevCurrent = { row: current.row, col: current.col };

            if (current.row === endNode.row && current.col === endNode.col) {
                setGrid(visitedLog);
                setStatus(`Solved: explored ${cnt}/${ROWS * COLS - obstacleCount - 2} nodes`);
                const finalGrid = await revealPath(visitedLog[current.row][current.col], runId, visitedLog);
                finishRun(finalGrid, runId);
                return;
            }

            const currentDist = dist.get(currentKey) ?? 0;

            for (const { row: r, col: c } of neighborsOf(current.row, current.col)) {
                const neighborNode = visitedLog[r][c];
                if (neighborNode.isObstacle || settled.has(key(r, c))) continue;

                const tentativeDist = useGScore ? currentDist + neighborNode.cost : 0;
                const neighborKey = key(r, c);
                const known = dist.get(neighborKey);

                if (known === undefined || tentativeDist < known) {
                    dist.set(neighborKey, tentativeDist);
                    visitedLog[r][c] = { ...visitedLog[r][c], previousNode: visitedLog[current.row][current.col] };
                    const h = heuristic ? heuristic(r, c) : 0;
                    queue.push({ row: r, col: c, priority: tentativeDist + h });
                    cnt++;
                }
            }

            workingGrid = visitedLog;
            setGrid(visitedLog);
            await delay(speed);
        }

        if (runIdRef.current !== runId) return;
        setStatus(`No solution found: explored ${cnt}/${ROWS * COLS - obstacleCount - 2} nodes`);
        finishRun(workingGrid, runId);
    }

    async function Dijkstra(initialGrid: NodeData[][], runId: number) {
        await weightedSearch(initialGrid, true, runId);
    }

    async function AStar(initialGrid: NodeData[][], runId: number) {
        const manhattan = (r: number, c: number) => Math.abs(r - endNode.row) + Math.abs(c - endNode.col);
        await weightedSearch(initialGrid, true, runId, manhattan);
    }

    async function Greedy(initialGrid: NodeData[][], runId: number) {
        const manhattan = (r: number, c: number) => Math.abs(r - endNode.row) + Math.abs(c - endNode.col);
        await weightedSearch(initialGrid, false, runId, manhattan);
    }

    async function BidirectionalBFS(initialGrid: NodeData[][], runId: number) {
        const MIN = 0, MAXROWS = ROWS - 1, MAXCOLS = COLS - 1;
        let cnt = 2;
        let startOrder = 1;
        let endOrder = 1;

        let workingGrid = initialGrid.map(r => r.slice());
        // separate visited/previousNode bookkeeping for each frontier, since both share the same isVisited flag on nodes
        const startVisited = new Map<string, NodeData>();
        const endVisited = new Map<string, NodeData>();
        const key = (r: number, c: number) => `${r},${c}`;

        const startQueue: Position[] = [{ row: startNode.row, col: startNode.col }];
        const endQueue: Position[] = [{ row: endNode.row, col: endNode.col }];
        workingGrid[endNode.row][endNode.col].isVisited = true;
        workingGrid[startNode.row][startNode.col].visitOrder = startOrder;
        workingGrid[endNode.row][endNode.col].visitOrder = endOrder;
        startVisited.set(key(startNode.row, startNode.col), workingGrid[startNode.row][startNode.col]);
        endVisited.set(key(endNode.row, endNode.col), workingGrid[endNode.row][endNode.col]);

        function expand(queue: Position[], visited: Map<string, NodeData>, otherVisited: Map<string, NodeData>, log: NodeData[][], isStartFrontier: boolean): Position | null {
            const nextQueue: Position[] = [];
            for (const row of log) {
                for (const node of row) {
                    node.isCurrent = false;
                }
            }
            for (const { row, col } of queue) {
                log[row][col].isCurrent = true;
                for (const { row: r, col: c } of neighborsOf(row, col)) {
                    if (log[r][c].isObstacle) continue;
                    const k = key(r, c);
                    if (visited.has(k)) continue;

                    if (isStartFrontier) {
                        startOrder++;
                        log[r][c] = { ...log[r][c], isVisited: true, previousNode: log[row][col], visitOrder: startOrder };
                    } else {
                        endOrder++;
                        log[r][c] = { ...log[r][c], isVisited: true, previousNode: log[row][col], visitOrder: endOrder };
                    }
                    visited.set(k, log[r][c]);
                    cnt++;

                    if (otherVisited.has(k)) {
                        return { row: r, col: c };
                    }
                    nextQueue.push({ row: r, col: c });
                }
            }
            queue.length = 0;
            queue.push(...nextQueue);
            return null;
        }

        while (startQueue.length !== 0 && endQueue.length !== 0) {
            if (runIdRef.current !== runId) return;
            const visitedLog = workingGrid.map(r => r.slice());

            const meetFromStart = expand(startQueue, startVisited, endVisited, visitedLog, true);
            const meetingPoint = meetFromStart ?? expand(endQueue, endVisited, startVisited, visitedLog, false);

            workingGrid = visitedLog;
            setGrid(visitedLog);

            if (meetingPoint) {
                setStatus(`Solved: explored ${cnt}/${ROWS * COLS - obstacleCount - 2} nodes`);

                const fromStart = reconstructPath(startVisited.get(key(meetingPoint.row, meetingPoint.col))!);
                let node: NodeData | null = endVisited.get(key(meetingPoint.row, meetingPoint.col))!.previousNode;
                const fromEnd: Position[] = [];
                while (node) {
                    fromEnd.push({ row: node.row, col: node.col });
                    node = node.previousNode;
                }
                const fullPath = [...fromStart, ...fromEnd];

                let pathGrid = workingGrid;
                for (const { row, col } of fullPath) {
                    if (runIdRef.current !== runId) return;
                    pathGrid = pathGrid.map(r => r.slice());
                    pathGrid[row][col] = { ...pathGrid[row][col], isPath: true, isCurrent: false };
                    setGrid(pathGrid);
                    await delay(speed);
                }
                finishRun(pathGrid, runId, true);
                return;
            }

            await delay(speed);
        }

        if (runIdRef.current !== runId) return;
        setStatus(`No solution found: explored ${cnt}/${ROWS * COLS - obstacleCount - 2} nodes`);
        finishRun(workingGrid, runId, true);
    }

    const originX = (ROWS - 1) * (TILE_WIDTH / 2);
    const gridWidth = originX + COLS * (TILE_WIDTH / 2);
    const gridHeight = (ROWS + COLS) * (TILE_HEIGHT / 2) + TILE_WIDTH / 2;

    // iso depth order: cells with a higher (row + col) sit lower on screen
    // and must render after (on top of) cells behind them
    const orderedNodes = grid
        .flat()
        .sort((a, b) => (a.row + a.col) - (b.row + b.col));

    const exploredEdges: { key: string; from: NodeData; to: NodeData }[] = [];
    const pathEdges: { key: string; from: NodeData; to: NodeData }[] = [];
    for (const node of grid.flat()) {
        if (!node.isVisited || !node.previousNode) continue;
        const prevLive = grid[node.previousNode.row][node.previousNode.col];
        const edge = { key: `${prevLive.row}-${prevLive.col}_${node.row}-${node.col}`, from: prevLive, to: node };
        if (node.isPath && prevLive.isPath) {
            pathEdges.push(edge);
        } else {
            exploredEdges.push(edge);
        }
    }

    return (
        <div className="grid-wrapper">
            <div className="grid" style={{ width: gridWidth, height: gridHeight }}>
                <svg className="grid-trace" width={gridWidth} height={gridHeight}>
                    {exploredEdges.map(({ key, from, to }) => {
                        const a = tileCenter(from.row, from.col, originX);
                        const b = tileCenter(to.row, to.col, originX);
                        return <line key={key} className="trace-explored" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
                    })}
                    {pathEdges.map(({ key, from, to }) => {
                        const a = tileCenter(from.row, from.col, originX);
                        const b = tileCenter(to.row, to.col, originX);
                        return <line key={key} className="trace-path" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
                    })}
                </svg>
                {orderedNodes.map(node => {
                    const { row, col, isStart, isEnd, isObstacle, isCurrent, terrain } = node;
                    return (
                        <Node
                            key={`${row}-${col}`}
                            row={row}
                            col={col}
                            isStart={isStart}
                            isEnd={isEnd}
                            isObstacle={isObstacle}
                            isCurrent={isCurrent}
                            terrain={terrain}
                            originX={originX}
                            onNodeClick={HandleNodeClick}
                        />
                    );
                })}
            </div>
            {status && <p className="status-line">{status}</p>}
        </div>
    )
}

export default Grid;
