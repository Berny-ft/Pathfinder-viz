import { useState } from 'react';
import Grid, { RunResult } from "./Components/Grid.tsx";
import GameTree from "./Components/GameTree.tsx";
import { TerrainType } from './constants/terrain.ts';

function App() {
    const [startChoice, editStartChoice] = useState(false);
    const [endChoice, editEndChoice] = useState(false);
    const [setObs, editSetObs] = useState(false);
    const [activeTerrain, setActiveTerrain] = useState<TerrainType>(TerrainType.Wall);
    const [setRun, editSetRun] = useState(0);
    const [searchType, editSearchType] = useState("DFS");
    const [resetGrid, editResetGrid] = useState(true);
    const [maze, editMaze] = useState(false);
    const [speed, setSpeed] = useState(35);
    const [runResult, setRunResult] = useState<RunResult | null>(null);
    const [isTreeOpen, setIsTreeOpen] = useState(false);

    function handleStartChoice() {
        editSetObs(false);
        editEndChoice(false);
        editStartChoice(!startChoice);
    }

    function handleEndChoice() {
        editSetObs(false);
        editStartChoice(false);
        editEndChoice(!endChoice);
    }

    function handleEditObs(terrainType: TerrainType = TerrainType.Wall) {
        editEndChoice(false);
        editStartChoice(false);
        setActiveTerrain(terrainType);
        editSetObs(true);
    }

    function handleRun() {
        editEndChoice(false);
        editStartChoice(false);
        editSetObs(false);
        editSetRun(run => run + 1);
    }

    function handleDfs() {
        editSearchType('DFS');
    }
    function handleBfs() {
        editSearchType('BFS');
    }
    function handleDijkstra() {
        editSearchType('Dijkstra');
    }
    function handleAStar() {
        editSearchType('AStar');
    }
    function handleGreedy() {
        editSearchType('Greedy');
    }
    function handleBiBfs() {
        editSearchType('BiBFS');
    }
    function handleReset() {
        editResetGrid(!resetGrid);
        setRunResult(null);
        setIsTreeOpen(false);
    }

    function handleMaze() {
        editMaze(!maze);
    }

    return (
        <div className="app-container">
            <h1>Pathfinding Visualizer</h1>

            <div className='menu'>
                <div className="menu-row">
                    <fieldset>
                        <legend>Algorithm</legend>
                        <label onClick={handleDfs}> DFS
                            <input id="DFS" type="radio" name="searchType" defaultChecked={searchType === 'DFS'} />
                        </label>
                        <label onClick={handleBfs}> BFS
                            <input id="BFS" type="radio" name="searchType" defaultChecked={searchType === 'BFS'} />
                        </label>
                        <label onClick={handleDijkstra}> Dijkstra
                            <input id="Dijkstra" type="radio" name="searchType" defaultChecked={searchType === 'Dijkstra'} />
                        </label>
                        <label onClick={handleAStar}> A*
                            <input id="AStar" type="radio" name="searchType" defaultChecked={searchType === 'AStar'} />
                        </label>
                        <label onClick={handleGreedy}> Greedy BFS
                            <input id="Greedy" type="radio" name="searchType" defaultChecked={searchType === 'Greedy'} />
                        </label>
                        <label onClick={handleBiBfs}> Bidirectional BFS
                            <input id="BiBFS" type="radio" name="searchType" defaultChecked={searchType === 'BiBFS'} />
                        </label>
                    </fieldset>

                    <fieldset>
                        <legend>Edit Grid</legend>
                        <div className="choices">
                            <button className={startChoice ? "startStyling" : ""} onClick={handleStartChoice}>Set Start</button>
                            <button className={endChoice ? "endStyling" : ""} onClick={handleEndChoice}>Set End</button>
                        </div>
                    </fieldset>

                    <fieldset className="speed-fieldset">
                        <legend>Speed</legend>
                        <div className="speed-control">
                            <input
                                type="range"
                                min={35}
                                max={150}
                                step={5}
                                value={185 - speed}
                                onChange={e => setSpeed(185 - Number(e.target.value))}
                            />
                        </div>
                    </fieldset>
                </div>

                <div className="menu-row">
                    <fieldset>
                        <legend>Terrain Brush (Costs)</legend>
                        <div className="choices">
                            <button
                                className={setObs && activeTerrain === TerrainType.Wall ? "obsStyling" : ""}
                                onClick={() => handleEditObs(TerrainType.Wall)}
                            >
                                Wall (∞)
                            </button>
                            <button
                                style={{ backgroundColor: setObs && activeTerrain === TerrainType.Grass ? "#2e7d32" : "#333" }}
                                onClick={() => handleEditObs(TerrainType.Grass)}
                            >
                                Grass (2)
                            </button>
                            <button
                                style={{ backgroundColor: setObs && activeTerrain === TerrainType.Water ? "#0288d1" : "#333" }}
                                onClick={() => handleEditObs(TerrainType.Water)}
                            >
                                Water (6)
                            </button>
                            <button
                                style={{ backgroundColor: setObs && activeTerrain === TerrainType.Mountain ? "#795548" : "#333" }}
                                onClick={() => handleEditObs(TerrainType.Mountain)}
                            >
                                Mountain (10)
                            </button>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Actions</legend>
                        <div className="choices">
                            <button onClick={handleMaze}>Generate Maze</button>
                            <button onClick={handleRun}>Run</button>
                            <button onClick={handleReset}>Reset</button>
                            <button disabled={!runResult} onClick={() => setIsTreeOpen(true)}>Search Tree</button>
                        </div>
                    </fieldset>
                </div>
            </div>

            <div className="grid-container">
                <Grid
                    setStartChoice={startChoice}
                    setEndChoice={endChoice}
                    setObs={setObs}
                    activeTerrain={activeTerrain}
                    setRun={setRun}
                    setSearchType={searchType}
                    resetGrid={resetGrid}
                    maze={maze}
                    speed={speed}
                    onRunComplete={setRunResult}
                />
            </div>

            {isTreeOpen && <GameTree result={runResult} onClose={() => setIsTreeOpen(false)} />}
        </div>
    );
}

export default App;
