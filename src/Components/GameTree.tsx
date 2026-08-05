import { useEffect, useMemo, useRef, useState } from 'react';
import './GameTree.css';
import { NodeData, TERRAIN_COLORS } from '../constants/terrain';
import type { RunResult } from './Grid';

interface TreeNode {
    key: string;
    row: number;
    col: number;
    terrain: NodeData['terrain'];
    visitOrder: number;
    isPath: boolean;
    isRoot: boolean;
    children: TreeNode[];
    x: number;
    y: number;
}

const NODE_RADIUS = 5;
const LAYER_HEIGHT = 46;
const SIBLING_GAP = 16;

function buildTree(root: NodeData, allNodes: NodeData[]): TreeNode | null {
    const byKey = new Map<string, NodeData[]>();
    for (const n of allNodes) {
        if (!n.previousNode) continue;
        const pKey = `${n.previousNode.row}-${n.previousNode.col}`;
        if (!byKey.has(pKey)) byKey.set(pKey, []);
        byKey.get(pKey)!.push(n);
    }

    function toTreeNode(node: NodeData, isRoot: boolean): TreeNode {
        const key = `${node.row}-${node.col}`;
        const childData = (byKey.get(key) ?? []).slice().sort((a, b) => (a.visitOrder ?? 0) - (b.visitOrder ?? 0));
        return {
            key,
            row: node.row,
            col: node.col,
            terrain: node.terrain,
            visitOrder: node.visitOrder ?? 0,
            isPath: node.isPath,
            isRoot,
            children: childData.map(c => toTreeNode(c, false)),
            x: 0,
            y: 0,
        };
    }

    return toTreeNode(root, true);
}

// assigns x (spread along siblings) and y (depth) to every node in-place, returns the subtree width in leaf units
function layoutTree(node: TreeNode, depth: number, nextLeafX: { value: number }): number {
    node.y = depth * LAYER_HEIGHT;

    if (node.children.length === 0) {
        node.x = nextLeafX.value * SIBLING_GAP;
        nextLeafX.value += 1;
        return node.x;
    }

    const childXs = node.children.map(child => layoutTree(child, depth + 1, nextLeafX));
    node.x = (childXs[0] + childXs[childXs.length - 1]) / 2;
    return node.x;
}

function flattenByVisitOrder(node: TreeNode, out: TreeNode[]) {
    out.push(node);
    for (const child of node.children) flattenByVisitOrder(child, out);
    out.sort((a, b) => a.visitOrder - b.visitOrder);
}

interface Edge {
    key: string;
    parent: TreeNode;
    child: TreeNode;
}

function collectEdges(node: TreeNode, out: Edge[]) {
    for (const child of node.children) {
        out.push({ key: `${node.key}_${child.key}`, parent: node, child });
        collectEdges(child, out);
    }
}

interface GameTreeProps {
    result: RunResult | null;
    onClose: () => void;
}

const GameTree = ({ result, onClose }: GameTreeProps) => {
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
    const panState = useRef<{ dragging: boolean; startX: number; startY: number; originX: number; originY: number }>({
        dragging: false, startX: 0, startY: 0, originX: 0, originY: 0,
    });
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handleKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    // React's onWheel is always a passive listener, so preventDefault() there
    // silently fails to stop page scroll; attach a native listener instead
    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return;
        function handleWheelNative(e: WheelEvent) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setView(v => ({ ...v, scale: Math.max(0.2, Math.min(3, v.scale + delta)) }));
        }
        el.addEventListener('wheel', handleWheelNative, { passive: false });
        return () => el.removeEventListener('wheel', handleWheelNative);
    }, []);

    const trees = useMemo(() => {
        if (!result) return [];
        const roots: NodeData[] = [];
        const startKey = `${result.startNode.row}-${result.startNode.col}`;
        const endKey = `${result.endNode.row}-${result.endNode.col}`;
        const allNodes = result.grid.flat().filter(n => n.isVisited);

        const startNodeData = allNodes.find(n => `${n.row}-${n.col}` === startKey);
        if (startNodeData) roots.push(startNodeData);

        if (result.isBidirectional) {
            const endNodeData = allNodes.find(n => `${n.row}-${n.col}` === endKey);
            if (endNodeData) roots.push(endNodeData);
        }

        return roots.map((root, i) => {
            const tree = buildTree(root, allNodes);
            if (!tree) return null;
            layoutTree(tree, 0, { value: 0 });
            const ordered: TreeNode[] = [];
            flattenByVisitOrder(tree, ordered);
            const edges: Edge[] = [];
            collectEdges(tree, edges);
            return { tree, ordered, edges, label: result.isBidirectional ? (i === 0 ? 'From Start' : 'From End') : null };
        }).filter((t): t is NonNullable<typeof t> => t !== null);
    }, [result]);

    const totalSteps = useMemo(() => trees.reduce((sum, t) => sum + t.ordered.length, 0), [trees]);

    useEffect(() => {
        setStep(0);
        setPlaying(false);
        setView({ scale: 1, x: 0, y: 0 });
    }, [result]);

    useEffect(() => {
        if (!playing) return;
        if (step >= totalSteps) {
            setPlaying(false);
            return;
        }
        const id = setTimeout(() => setStep(s => s + 1), 60);
        return () => clearTimeout(id);
    }, [playing, step, totalSteps]);

    function visibleKeysForTree(treeIndex: number): Set<string> {
        const visible = new Set<string>();
        let consumed = 0;
        for (let i = 0; i < treeIndex; i++) consumed += trees[i].ordered.length;
        const localStep = Math.max(0, Math.min(step - consumed, trees[treeIndex].ordered.length));
        for (let i = 0; i < localStep; i++) visible.add(trees[treeIndex].ordered[i].key);
        return visible;
    }

    function handlePointerDown(e: React.PointerEvent) {
        panState.current = {
            dragging: true,
            startX: e.clientX,
            startY: e.clientY,
            originX: view.x,
            originY: view.y,
        };
        (e.target as Element).setPointerCapture(e.pointerId);
    }

    function handlePointerMove(e: React.PointerEvent) {
        if (!panState.current.dragging) return;
        const dx = e.clientX - panState.current.startX;
        const dy = e.clientY - panState.current.startY;
        setView(v => ({ ...v, x: panState.current.originX + dx, y: panState.current.originY + dy }));
    }

    function handlePointerUp() {
        panState.current.dragging = false;
    }

    if (!result || trees.length === 0) {
        return null;
    }

    return (
        <div className="game-tree-backdrop" onClick={onClose}>
            <div className="game-tree-panel" onClick={e => e.stopPropagation()}>
                <div className="game-tree-header">
                    <h2>Search Tree</h2>
                    <button className="game-tree-close" onClick={onClose} aria-label="Close">✕</button>
                </div>

                <div className="game-tree-controls">
                    <button onClick={() => setPlaying(p => !p)}>
                        {playing ? 'Pause' : step >= totalSteps ? 'Replay' : 'Play'}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={totalSteps}
                        value={step}
                        onChange={e => {
                            setPlaying(false);
                            setStep(Number(e.target.value));
                        }}
                    />
                    <span className="game-tree-step">{step}/{totalSteps}</span>
                </div>

                <div
                    ref={canvasRef}
                    className="game-tree-canvas"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    <div
                        className="game-tree-viewport"
                        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
                    >
                        {trees.map((t, i) => {
                            const visible = visibleKeysForTree(i);
                            const width = Math.max(...t.ordered.map(n => n.x)) + NODE_RADIUS * 4;
                            const height = Math.max(...t.ordered.map(n => n.y)) + NODE_RADIUS * 4;
                            return (
                                <div key={i} className="game-tree-subtree" style={{ marginLeft: i > 0 ? 60 : 0 }}>
                                    {t.label && <div className="game-tree-sublabel">{t.label}</div>}
                                    <svg width={width} height={height}>
                                        {t.edges.map(edge => {
                                            if (!visible.has(edge.child.key)) return null;
                                            const color = edge.child.isPath && step >= totalSteps
                                                ? '#2ecc59'
                                                : TERRAIN_COLORS[edge.child.terrain];
                                            return (
                                                <line
                                                    key={edge.key}
                                                    x1={edge.parent.x + NODE_RADIUS * 2}
                                                    y1={edge.parent.y + NODE_RADIUS * 2}
                                                    x2={edge.child.x + NODE_RADIUS * 2}
                                                    y2={edge.child.y + NODE_RADIUS * 2}
                                                    stroke={color}
                                                    strokeWidth={edge.child.isPath && step >= totalSteps ? 2.5 : 1.5}
                                                />
                                            );
                                        })}
                                        {t.ordered.map(node => {
                                            if (!visible.has(node.key)) return null;
                                            return (
                                                <circle
                                                    key={node.key}
                                                    cx={node.x + NODE_RADIUS * 2}
                                                    cy={node.y + NODE_RADIUS * 2}
                                                    r={node.isRoot ? NODE_RADIUS + 1.5 : NODE_RADIUS}
                                                    className={node.isRoot ? 'tree-node-root' : 'tree-node'}
                                                />
                                            );
                                        })}
                                    </svg>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameTree;
