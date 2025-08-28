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




const Grid = ({setStartChoice,setEndChoice,setObs,setRun,setSearchType,resetGrid,maze})=> {// correct name is needed here
    // use state to store the grid and the edit function associated with it
    const[grid, setGrid] = useState([]) // the grid begins empty, but then we associate then initialize to it
    const [startNode, setStartNode] = useState({row:null,col:null});
    const [endNode, setEndNode] = useState({row:null,col:null});

    // use effect used to run code only when we mount the component so we use it to initialize the grid
    useEffect(()=>{
        setGrid(initializeGrid());
    },[]) // the empty array as dependency means that it only runs one since the array can never change

    // this allows to reset the grid when using the button
    useEffect(() => {
        setGrid(initializeGrid());
    }, [resetGrid]);


    useEffect(() => {
        // This is the GUARD CLAUSE. It checks two things:
        // 1. Do we want to run the maze? (maze is true)
        // 2. Is the grid ready? (grid.length > 0)
        if (maze) {
            mazeDFS();
        }
    }, [maze]); // Add `grid` as a dependency





    function mazeDFS(){
        // first we need a grid full of obstacles
        const tempGrid = grid.map(r => r.slice().map(node => ({
            ...node,
            isStart: false,
            isEnd: false,
            isObstacle: true,
            isVisited: false,
            previousNode: null,
        })));

        // this is the starting point
        let row = Math.floor(ROWS/2);
        let col = Math.floor(COLS/2);



        // bounds checking
        const MIN = 0;
        const MAXROWS = ROWS - 1;
        const MAXCOLS = COLS - 1;
        const boundsCheckUp = (row) => row - 1 >= MIN;
        const boundsCheckDown = (row) => row + 1 <= MAXROWS;
        const boundsCheckRight = (col) => col + 1 <= MAXCOLS;
        const boundsCheckLeft = (col) => col - 1 >= MIN;

        // Helper function to count explored neighbors of a cell
        const countExploredNeighbors = (r, c) => {
            let count = 0;
            if (boundsCheckUp(r) && tempGrid[r - 1][c].isVisited) count++;
            if (boundsCheckDown(r) && tempGrid[r + 1][c].isVisited) count++;
            if (boundsCheckLeft(c) && tempGrid[r][c - 1].isVisited) count++;
            if (boundsCheckRight(c) && tempGrid[r][c + 1].isVisited) count++;
            return count;
        };

        // Mark starting position
        tempGrid[row][col].isObstacle = false;
        tempGrid[row][col].isVisited = true;

        let options = [0, 1, 2, 3]; // up, right, down, left

        while (true) {
            // If no options available, backtrack
            if (options.length === 0) {
                if (tempGrid[row][col].previousNode === null) {
                    // We've backtracked to the start, maze is complete
                    break;
                }

                // Backtrack to previous node
                const prevNode = tempGrid[row][col].previousNode;
                row = prevNode.row;
                col = prevNode.col;
                options = [0, 1, 2, 3];
                continue;
            }

            const randIdx = Math.floor(Math.random() * options.length);
            const choice = options[randIdx];
            let moved = false;

            if (choice === 0) { // UP
                if (boundsCheckUp(row) &&
                    !tempGrid[row - 1][col].isVisited &&
                    countExploredNeighbors(row - 1, col) === 1) { // Only current cell should be explored neighbor

                    row--;
                    tempGrid[row][col].isObstacle = false;
                    tempGrid[row][col].isVisited = true;
                    tempGrid[row][col].previousNode = tempGrid[row + 1][col];
                    options = [0, 1, 2, 3];
                    moved = true;
                }
            } else if (choice === 1) { // RIGHT
                if (boundsCheckRight(col) &&
                    !tempGrid[row][col + 1].isVisited &&
                    countExploredNeighbors(row, col + 1) === 1) { // Only current cell should be explored neighbor

                    col++;
                    tempGrid[row][col].isObstacle = false;
                    tempGrid[row][col].isVisited = true;
                    tempGrid[row][col].previousNode = tempGrid[row][col - 1];
                    options = [0, 1, 2, 3];
                    moved = true;
                }
            } else if (choice === 2) { // DOWN
                if (boundsCheckDown(row) &&
                    !tempGrid[row + 1][col].isVisited &&
                    countExploredNeighbors(row + 1, col) === 1) { // Only current cell should be explored neighbor

                    row++;
                    tempGrid[row][col].isObstacle = false;
                    tempGrid[row][col].isVisited = true;
                    tempGrid[row][col].previousNode = tempGrid[row - 1][col];
                    options = [0, 1, 2, 3];
                    moved = true;
                }
            } else if (choice === 3) { // LEFT
                if (boundsCheckLeft(col) &&
                    !tempGrid[row][col - 1].isVisited &&
                    countExploredNeighbors(row, col - 1) === 1) { // Only current cell should be explored neighbor

                    col--;
                    tempGrid[row][col].isObstacle = false;
                    tempGrid[row][col].isVisited = true;
                    tempGrid[row][col].previousNode = tempGrid[row][col + 1];
                    options = [0, 1, 2, 3];
                    moved = true;
                }
            }

            // If we couldn't move in this direction, remove it from options
            if (!moved) {
                options.splice(randIdx, 1);
            }
        }

        // Reset visited flags for the final grid
        const finalGrid = tempGrid.map(r => r.slice().map(node => ({
            ...node,
            isVisited: false
        })));

        setGrid(finalGrid);
    }

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


        let cnt = 1
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
                visitedLog[row][col].isVisited = true; // Add this line
                setGrid(visitedLog);
                alert(`Solved, explored ${cnt}/${ROWS*COLS} Nodes`)
                break;
            } else if ( boundsCheckUp && !grid[row-1][col].isObstacle && !grid[row-1][col].isVisited){ // bounds checking when moving upwards
                cnt++;

                row = row-1

                visitedLog[row][col].isVisited = true
                visitedLog[row][col].previousNode = visitedLog[prevRow][prevCol]

                // re render


            } else if (boundsCheckRight && !grid[row][col+1].isObstacle && !grid[row][col+1].isVisited){// bounds checking when moving right
                cnt++
                col = col+1
                visitedLog[row][col].isVisited = true
                visitedLog[row][col].previousNode = visitedLog[prevRow][prevCol]



            } else if (boundsCheckDown && !grid[row+1][col].isObstacle &&  !grid[row+1][col].isVisited){
                cnt++
                row = row+1

                visitedLog[row][col].isVisited = true
                visitedLog[row][col].previousNode = visitedLog[prevRow][prevCol]
            } else if (boundsCheckLeft && !grid[row][col-1].isObstacle && !grid[row][col-1].isVisited) {// bounds checking when moving right
                cnt++
                col = col - 1
                visitedLog[row][col].isVisited = true
                visitedLog[row][col].previousNode = visitedLog[prevRow][prevCol]
            } else if (!visitedLog[row][col].previousNode) {
                // no previous node means we’ve backtracked all the way
                alert(`No solution found, explored ${cnt}/${ROWS*COLS} Nodes`);
                break;
            } else {
                // backtrack using the node we actually recorded
                const prev = visitedLog[row][col].previousNode;
                row = prev.row;
                col = prev.col;
            }





            // rerender
            setGrid(visitedLog)
            await delay(20);





        }

    }
    async function BFS(){
        //




        const MIN = 0
        const MAXROWS = ROWS-1
        const MAXCOLS = COLS-1

        let cnt = 1;

        const queue = [{row:startNode.row,col:startNode.col}] // this is a bad queue but meh
        while(queue.length !== 0){

            // keeping track of the grid
            const visitedLog = grid.map(r => r.slice())

            //push the 4 edges if available to the queue
            const first = queue.shift();
            // up
            if (MAXROWS >= first.row - 1 && first.row - 1 >= MIN && !grid[first.row - 1][first.col].isVisited && !grid[first.row - 1][first.col].isObstacle) {
                if (first.row - 1 === endNode.row && first.col === endNode.col) {
                    alert(`Solved, explored ${cnt}/${ROWS*COLS} Nodes`)
                    break; // we found the end
                }
                queue.push({ row: first.row - 1, col: first.col });
                visitedLog[first.row - 1][first.col].isVisited = true
                cnt++
            }

// down
            if (MAXROWS >= first.row + 1 && first.row + 1 >= MIN && !grid[first.row + 1][first.col].isVisited && !grid[first.row + 1][first.col].isObstacle) {
                if (first.row + 1 === endNode.row && first.col === endNode.col) {
                    alert(`Solved, explored ${cnt}/${ROWS*COLS} Nodes`)
                    break; // we found the end
                }
                queue.push({ row: first.row + 1, col: first.col });
                visitedLog[first.row + 1][first.col].isVisited = true
                cnt++
            }

// right
            if (MAXCOLS >= first.col + 1 && first.col + 1 >= MIN && !grid[first.row][first.col + 1].isVisited && !grid[first.row][first.col + 1].isObstacle) {
                if (first.row === endNode.row && first.col + 1 === endNode.col) {
                    alert(`Solved, explored ${cnt}/${ROWS*COLS} Nodes`)
                    break; // we found the end
                }
                queue.push({ row: first.row, col: first.col + 1 });
                visitedLog[first.row][first.col+1].isVisited = true
                cnt++
            }

// left
            if (MAXCOLS >= first.col - 1 && first.col - 1 >= MIN && !grid[first.row][first.col - 1].isVisited && !grid[first.row][first.col - 1].isObstacle) {
                if (first.row === endNode.row && first.col - 1 === endNode.col) {
                    alert(`Solved, explored ${cnt}/${ROWS*COLS} Nodes`)
                    break; // we found the end
                }
                queue.push({ row: first.row, col: first.col - 1 });
                visitedLog[first.row][first.col-1].isVisited = true
                cnt++
            }

            // rerender
            setGrid(visitedLog)
            await delay(20);





        }
        if(queue.length === 0){
            alert(`No solution found explored ${cnt}/${ROWS*COLS} Nodes`)
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