
import './Node.css';


const Node = ({row,col,isStart,onNodeClick}) =>{ // the row and col props are received from higher up
    // determine the css based on the prop so we can change depending on the algo
    // the parent grid does also tell i fthe current node is the start or not

    const extraClassName= isStart ? 'node-start' : ''; // so we add is start to css and if it is actually the starting point

    // so the method onNodeClick refers to a method higher up in the hierarchy we want to run it if the node is clicked



    return <div className={`node ${extraClassName}`} onClick={()=> onNodeClick(row,col)}></div> // a node simply shows as a 20/20 block


}

export default Node;