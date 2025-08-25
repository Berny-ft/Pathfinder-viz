import {useEffect,useState} from 'react'

import Node from "./Node.jsx";

import './Grid.css' // importing the styling for the grid


// dimensions of the grid
const ROWS = 20;
const COLS = 20;

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




const Grid = ({setStartChoice,setEndChoice,setObs,setRun,setSearchType})=> {// correct name is needed here
    // use state to store the grid and the edit function associated with it
    const[grid, setGrid] = useState([]) // the grid begins empty, but then we associate then initialize to it
    const [startNode, setStartNode] = useState({row:null,col:null});
    const [endNode, setEndNode] = useState({row:null,col:null});

    // use effect used to run code only when we mount the component so we use it to initialize the grid
    useEffect(()=>{
        setGrid(initializeGrid());
    },[]) // the empty array as dependency means that it only runs one since the array can never change


    // if the node is clicked it tells it to the grid through on link
    function HandleNodeClick(row,col){
        if (setStartChoice) {
            const newGrid = grid.map(gridRow => gridRow.slice()); // slice used to copy here

            if (startNode.row != null) { // if it was already selected (we already have a start somewhere) we deselect
                const prevStartNode = newGrid[startNode.row][startNode.col]
                prevStartNode.isStart = false;
                prevStartNode.isVisited = false;

            }


            const clickedNode = newGrid[row][col]
            clickedNode.isVisited = true;
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

    useEffect(() => {
        if (startNode.row !== null && endNode.col !== null) {
            if (setRun){
                if (setSearchType === 'DFS'){
                    DFS()
                }else if (setSearchType === "BFS"){
                    BFS()
                }
            }

        }
    }, [setRun]);



    // got to figure this out I still don't get it
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    async function DFS(){





        let row  = startNode.row;
        let col = startNode.col;


        //visitedLog[row][col].isVisited = true;

        const MIN = 0
        const MAXROWS = ROWS-1
        const MAXCOLS = COLS-1



        while(true){



           // if up is not out of bounds nor obstacle set current node to previous
            // go up and set it to current push current node in the stack  if current is the end. break
            // you could pop c
            // else the same for right
            // else the same of down
            // else the same for left
            // else pop current from the stack  use it
            // each node has a previous
            // after each rul timeout of 20ms do nothing

            // keeping track of positioning
            const prevRow = row;
            const prevCol = col;

            // creating the new grid to edit
            const visitedLog = grid.map(gridRow => gridRow.slice());

            const boundsCheckUp = MAXROWS >=row-1 && row-1>= MIN  && MAXCOLS >=col && col>= MIN
            const boundsCheckDown = MAXROWS >=row+1 && row+1>= MIN  && MAXCOLS >=col && col>= MIN
            const boundsCheckRight = MAXROWS >=row && row>= MIN  && MAXCOLS >=col+1 && col+1>= MIN
            const boundsCheckLeft = MAXROWS >=row && row>= MIN  && MAXCOLS >=col-1 && col-1>= MIN
            if (endNode.row === row && endNode.col === col){ // stopping condition if the end is reached
                alert("Solved")
                break;
            } else if ( boundsCheckUp && !grid[row-1][col].isObstacle && !grid[row-1][col].isVisited){ // bounds checking when moving upwards
                console.log("moving up")

                row = row-1

                visitedLog[row][col].isVisited = true
                visitedLog[row][col].previousNode = visitedLog[prevRow][prevCol]

                // re render


            } else if (boundsCheckRight && !grid[row][col+1].isObstacle && !grid[row][col+1].isVisited){// bounds checking when moving right
                console.log("moving right")
                col = col+1
                visitedLog[row][col].isVisited = true
                visitedLog[row][col].previousNode = visitedLog[prevRow][prevCol]



            } else if (boundsCheckDown && !grid[row+1][col].isObstacle &&  !grid[row+1][col].isVisited){
                row = row+1

                visitedLog[row][col].isVisited = true
                visitedLog[row][col].previousNode = visitedLog[prevRow][prevCol]
            } else if (boundsCheckLeft && !grid[row][col-1].isObstacle && !grid[row][col-1].isVisited) {// bounds checking when moving right
                console.log("moving right")
                col = col - 1
                visitedLog[row][col].isVisited = true
                visitedLog[row][col].previousNode = visitedLog[prevRow][prevCol]
            }else if(grid[row][col].previousNode.row === startNode.row && grid[row][col].previousNode.col === startNode.col){
                alert("No solution found")
                break;
            } else {// backtrack
                row  = grid[row][col].previousNode.row
                col  = grid[row][col].previousNode.col

            }





            // rerender
            setGrid(visitedLog)
            await delay(5);





        }

    }
    function BFS(){
        //
    }

    return (
        <div className='grid'>
            {grid.map((row,rowIndex)=> {
                return (
                    // mapping each row to a div
                    <div key={rowIndex} className='grid-row'>
                        {/*within each row we want to render each Node*/}
                        {row.map((node,nodeIndex)=>{
                            const {row, col,isStart, isEnd, isObstacle, isVisited} = node // from each node object in the grid we destructure to take their col and row
                            return (<Node key={nodeIndex} row={row} col={col} isStart={isStart} isEnd={isEnd} isObstacle={isObstacle} isVisited={isVisited} onNodeClick={HandleNodeClick}></Node>)
                        })}
                    </div>

                )
            })}

        </div>
    )
}


export default Grid;