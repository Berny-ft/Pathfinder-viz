import { useState } from 'react'
import Grid from "./Components/Grid.jsx";

function App() {


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
        <button>Set Start</button>
        <button>Set End</button>
        <button>Set walls</button>
        <button>RUN</button>
        </div>
        </div>

        <Grid/> {/*self contained component */}

    </>
  )
}

export default App
