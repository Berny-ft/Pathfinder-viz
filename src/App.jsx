import { useState, useEffect } from 'react'
import Grid from "./Components/Grid.jsx";

function App() {
    const[startChoice, editStartChoice] = useState(false)
    const[endChoice, editEndChoice] = useState(false);
    const [setObs, editSetObs] = useState(false)
    const [setRun, editSetRun] = useState(false)
    const [searchType, editSearchType] = useState("DFS")

    function handleStartChoice(){
        editSetObs(false)
        editEndChoice(false)
        editSetRun(false)
        const start = startChoice === false
        editStartChoice(start)
    }

    function handleEndChoice() {
        editSetObs(false)
        editStartChoice(false)
        editSetRun(false)
        const end = endChoice === false
        editEndChoice(end)
    }

    function handleEditObs() {
        editEndChoice(false)
        editStartChoice(false)
        editSetRun(false)
        const obs = setObs === false
        editSetObs(obs)
    }

    function handleRun(){
        editEndChoice(false)
        editStartChoice(false)
        editSetObs(false)
        const tempRun = setRun === false;
        editSetRun(tempRun)
    }

    function handleDfs(){
        editSearchType('DFS')
    }
    function handleBfs(){
        editSearchType('BFS')
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
        <button className={ `${setRun ? "runStyling": ""}`} onClick={handleRun}>RUN</button>
        <button onClick={()=> location.reload()}>RESET</button>
        </div>
        </div>

        <Grid setStartChoice={startChoice} setEndChoice={endChoice} setObs={setObs} setRun={setRun} setSearchType={searchType}/> {/*self contained component */}

    </>
  )
}

export default App
