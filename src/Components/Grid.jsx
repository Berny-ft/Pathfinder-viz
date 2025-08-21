import {useEffect,useState} from 'react'

import Node from "./Node.jsx";

import './Grid.css' // importing the styling for the grid



const ROWS = 20;
const COLS = 50;

// helper function to create the initial grid data structure
// we need it to be based on the function since it occurs when the page is loaded
function initializeGrid() {
    const grid  = [];

    for (let row = 0 ; row < ROWS; row++){
        const CurrentRow = [];
        for (let col  = 0 ; col < COLS;  col++){
            // so each node does have its own properties (it's an object) and we've just defined it using its position
            // we're adding to eah row all the column nodes associated to that row
            CurrentRow.push(
                // we are pushing an object
                {
                    row,col,
                    isStart: false,// if it is the starting point of the search
                    isEnd: false, // again if it is the end of the search
                    isObstacle: false,
                    isVisited: false,

                    previousNode:null, //

                }
            )// append equivalent append
        }
        grid.push(CurrentRow)
    }

    return grid;
}


function DFS(start,end,grid){

}
function BFS(start,end,grid){

}

const Grid = ({setStartChoice,setEndChoice,setObs,setRun,setSearchType})=> {// correct name is needed here
    // use state to store the grid and the edit function associated with it
    const[grid, setGrid] = useState([]) // the grid begins empty but then we associate the initialize to it
    const [startNode, setStartNode] = useState({row:null,col:null});
    const [endNode, setEndNode] = useState({row:null,col:null});

    // use effect used to run code only when we mount the component so we use it to initialize the grid
    useEffect(()=>{
        setGrid(initializeGrid());
    },[]) // the empty array as dependency means that it only runs one since the array can never change


    // if the node is clicked it tells it to the grid through on lick
    function HandleNodeClick(row,col){
        if (setStartChoice) {
            const newGrid = grid.map(gridRow => gridRow.slice()); // slice used to copy here

            if (startNode.row != null) { // if it was already selected we deselect
                const prevStartNode = newGrid[startNode.row][startNode.col]
                prevStartNode.isStart = false;
            }


            const clickedNode = newGrid[row][col]
            clickedNode.isStart = true;

            setStartNode({row, col})

            setGrid(newGrid)
        } else if (setEndChoice) {
            const newGrid = grid.map(gridRow => gridRow.slice())

            if (endNode.row !=null) { // if the node was not yet selected
                const prevEndNode = newGrid[endNode.row][endNode.col]
                prevEndNode.isEnd =false; // setting the old node to null
            }

            const clickedNode = newGrid[row][col] // setting the
            clickedNode.isEnd = true; // modifying the state of the targeted  node before setting the new grid
            setEndNode({row,col})
            setGrid(newGrid)
        } else if (setObs) {

            const newGrid = grid.map(gridRow => gridRow.slice())

            if (newGrid[row][col].isObstacle){
                newGrid[row][col].isObstacle = false;
            } else {

                const clickedNode = newGrid[row][col]
                clickedNode.isObstacle = true;

            }
            setGrid(newGrid)
            //
        }
    }

    if (startNode.row !== null && endNode.col !== null) {
        if (setRun){
            if (setSearchType === 'DFS'){
                DFS(startNode,endNode,grid)
            }else if (setSearchType === "BFS"){
                BFS(startNode,endNode,grid)
            }
        }

    }

    return (
        <div className='grid'>
            {grid.map((row,rowIndex)=> {
                return (
                    // mapping each row to a div
                    <div key={rowIndex} className='grid-row'>
                        {/*within each row we want to render each Node*/}
                        {row.map((node,nodeIndex)=>{
                            const {row, col,isStart, isEnd, isObstacle} = node // from each node object in the grid we destructure to take their col and row
                            return (<Node key={nodeIndex} row={row} col={col} isStart={isStart} isEnd={isEnd} isObstacle={isObstacle} onNodeClick={HandleNodeClick}></Node>)
                        })}
                    </div>

                )
            })}

        </div>
    )
}


export default Grid;