import { useState, useEffect } from 'react'
import Grid from "./Components/Grid.jsx";

function App() {
    const[startChoice, editStartChoice] = useState(false)
    const[endChoice, editEndChoice] = useState(false);
    const [setObs, editSetObs] = useState(false)

    function handleStartChoice(){
        editSetObs(false)
        editEndChoice(false)
        const start = startChoice === false
        editStartChoice(start)
    }

    function handleEndChoice() {
        editSetObs(false)
        editStartChoice(false)
        const end = endChoice === false
        editEndChoice(end)
    }

    function handleEditObs() {
        editEndChoice(false)
        editStartChoice(false)
        const obs = setObs === false
        editSetObs(obs)
    }





    return (
    <>
      <h1>Pathfinding visualizer</h1>

        <div className='menu'>
        <label > DFS
        <input type="radio" name="type"/>
        </label>
        <label> BFS
        <input type="radio" name="type"/>
        </label>
        <div className="choices">
        <button className={`${startChoice ? "startStyling" : ""} `} onClick={handleStartChoice}>Set Start</button>
        <button className={`${endChoice ? "endStyling" : ""}`} onClick={handleEndChoice}>Set End</button>
        <button className={`${setObs ? "obsStyling" : ""}`} onClick={handleEditObs}>Set Obstacles</button>
        <button>RUN</button>
        <button onClick={()=> location.reload()}>RESET</button>
        </div>
        </div>

        <Grid setStartChoice={startChoice} setEndChoice={endChoice} setObs={setObs}/> {/*self contained component */}

    </>
  )
}

export default App
