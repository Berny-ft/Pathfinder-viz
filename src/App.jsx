import { useState, useEffect } from 'react'
import Grid from "./Components/Grid.jsx";

function App() {
    const[startChoice, editStartChoice] = useState(false)


    function handleStartChoice(){
        const start = startChoice === false
        editStartChoice(start)
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
        <button className={startChoice ? "startStyling" : ''} onClick={handleStartChoice}>Set Start</button>
        <button>Set End</button>
        <button>Set walls</button>
        <button>RUN</button>
        </div>
        </div>

        <Grid setStartChoice={startChoice}/> {/*self contained component */}

    </>
  )
}

export default App
