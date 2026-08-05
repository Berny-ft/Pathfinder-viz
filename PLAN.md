# GraphEngine — High-Performance Spatial Pathfinding & Dynamic Routing Suite

## Overview
Transform `pathfinder-viz` from a standard BFS/DFS grid visualizer into an advanced CS algorithm engineering showcase.

---

## 🎯 Key Upgrade Features

### Phase 1: Engine & Grid Infrastructure
- **High-Performance Grid Rendering**: 60 FPS animation on dense grids (50×50 up to 100×100) using optimized React/Canvas or SVG rendering.
- **Weighted Terrains**:
  - Road (Cost: 1)
  - Grass / Dirt (Cost: 3)
  - Water / Swamp (Cost: 6)
  - Mountain (Cost: 10)
  - Wall (Impassable / Infinity)

### Phase 2: Algorithm Suite (`src/algorithms/`)
- **Unweighted Search**:
  - Breadth-First Search (BFS)
  - Depth-First Search (DFS)
  - Bi-directional BFS
- **Weighted Heuristic Search**:
  - Dijkstra's Algorithm
  - A* Search (with selectable heuristics: *Manhattan*, *Euclidean*, *Chebyshev*)
- **High-Performance & Dynamic Search (Showcase Algorithms)**:
  - **Jump Point Search (JPS)**: Symmetry-skipping grid search (10x–100x faster than standard A* on open grids).
  - **D* Lite / Dynamic A***: Real-time path repair when obstacles move mid-execution.
  - **IDA* (Iterative Deepening A*)**: Memory-efficient heuristic search.

### Phase 3: Maze & Terrain Generators
- **Kruskal’s Algorithm**
- **Prim’s Algorithm**
- **Recursive Division**
- **Wilson’s Algorithm** (loop-erased random walk maze generator)

### Phase 4: Side-by-Side Benchmark & Telemetry Dashboard
- **Split View Comparison**: Run two algorithms (e.g. A* vs. JPS) simultaneously side-by-side on the exact same map/terrain.
- **Live Telemetry Cards**:
  - ⚡ **Execution Time (ms)**
  - 🔍 **Nodes Explored / Visited**
  - 📏 **Path Length / Total Cost**
  - 💾 **Peak Memory Allocation**

### Phase 5: Real-Time Interactive Controls
- Drag start/end nodes or add obstacles live while path is animating.
- Speed controls, brush selector (walls/terrains), clear grid / clear path buttons.

---

## 📁 Suggested Directory Structure

```
pathfinder-viz/
├── PLAN.md
├── src/
│   ├── algorithms/
│   │   ├── bfs.js
│   │   ├── dfs.js
│   │   ├── dijkstra.js
│   │   ├── astar.js
│   │   ├── jps.js
│   │   ├── dstarLite.js
│   │   └── idastar.js
│   ├── mazes/
│   │   ├── kruskal.js
│   │   ├── prim.js
│   │   ├── recursiveDivision.js
│   │   └── wilson.js
│   ├── components/
│   │   ├── Grid.jsx
│   │   ├── Controls.jsx
│   │   ├── BenchmarkDashboard.jsx
│   │   └── TelemetryCard.jsx
│   └── App.jsx
```
