import { useState } from 'react'
import Grid from "./Components/Grid.jsx";

function App() {
    const[startChoice, editStartChoice] = useState(false)
    const[endChoice, editEndChoice] = useState(false);
    const [setObs, editSetObs] = useState(false)
    const [setRun, editSetRun] = useState(false)
    const [searchType, editSearchType] = useState("DFS")
    const [resetGrid,editResetGrid] = useState(true)
    const [maze, editMaze] = useState(false)

    function handleStartChoice(){
        editSetObs(false)
        editEndChoice(false)
        editSetRun(false)
        editStartChoice(!startChoice)
    }

    function handleEndChoice() {
        editSetObs(false)
        editStartChoice(false)
        editSetRun(false)
        editEndChoice(!endChoice)
    }

    function handleEditObs() {
        editEndChoice(false)
        editStartChoice(false)
        editSetRun(false)
        editSetObs(!setObs)
    }

    function handleRun(){
        editEndChoice(false)
        editStartChoice(false)
        editSetObs(false)
        editSetRun(!setRun)
    }

    function handleDfs(){
        editSearchType('DFS')
    }
    function handleBfs(){
        editSearchType('BFS')
    }
    function handleReset(){
        editResetGrid(!resetGrid)
    }

    function handleMaze(){
        editMaze(!maze)
    }

    return (
    <>
      <h1>Pathfinding visualizer</h1>

        <div className='menu'>
        <label onClick={handleDfs}> DFS
        <input  id="DFS" type="radio" name="searchType"/>
        </label>
        <label onClick={handleBfs}> BFS
        <input id="BFS" type="radio" name="searchType"/>
        </label>
        <div className="choices">
        <button className={`${startChoice ? "startStyling" : ""} `} onClick={handleStartChoice}>Set Start</button>
        <button className={`${endChoice ? "endStyling" : ""}`} onClick={handleEndChoice}>Set End</button>
        <button className={`${setObs ? "obsStyling" : ""}`} onClick={handleEditObs}>Set Obstacles</button>
        <button className={ `${setRun ? "runStyling": ""}`} onClick={handleRun}>Run</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleMaze}>Maze</button>

        </div>

        </div>


        <Grid setStartChoice={startChoice} setEndChoice={endChoice} setObs={setObs} setRun={setRun} setSearchType={searchType} resetGrid={resetGrid} maze={maze}/> {/*self contained component */}
        <br/>
        <div><b>Node data</b> <ul className="node-data">

            <li>X: <span>Null</span></li>
            <li>Y: <span>Null</span></li>
            <li>Start: <span>Null</span></li>
            <li>End: <span>Null</span></li>
            <li>Obstacle: <span>Null</span></li>
            <li>Visited: <span>Null</span></li>
        </ul>
        </div>
    </>
  )
}

export default App
