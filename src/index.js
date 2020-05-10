import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const sudoku = require("sudoku");
var puzzle = sudoku.makepuzzle();
var solution = sudoku.solvepuzzle(puzzle);
var exception = findException();
var cheatpuzzle = sudoku.solvepuzzle(puzzle);
cheatpuzzle[exception] = null;

function singleDigitsOnly(id) {
    var num = document.getElementById(id);
    var regex = /[^0-9]/;
    num.value = num.value.replace(regex, "");
}
function SudokuSquare(props) {
    return(
        <input id={props.id} type="text" className="square" maxLength="1" defaultValue={props.value} onInput={props.onInput} onChange={props.onChange}></input>
    )
}
function SudokuSquareHint(props) {
    return(
        <input id={props.id} type="text" className="hint" value={props.value} readOnly></input>
    )
}
class Board extends React.Component {
    
    //Fill With Puzzle:
    renderSodkuSquare(i){
        var num = puzzle[i];

        if (num == null){
            return(
                <td>
                    <SudokuSquare
                        id={i}
                        defaultValue={""}
                        onInput={() => singleDigitsOnly(i)}
                        onChange={(e) => this.props.onChange(e)}
                    />
                </td>
            );
        } else{
            return(
                <td>
                    <SudokuSquareHint
                        id={i}
                        value={num}
                    />
                </td>
            );
        }
    }
    renderSodkuRow(i){
        var classname ="SudokuRow-"+i;
        return(
            <tr className={classname}>
                {this.renderSodkuSquare(0+(9*i))}
                {this.renderSodkuSquare(1+(9*i))}
                {this.renderSodkuSquare(2+(9*i))}
                {this.renderSodkuSquare(3+(9*i))}
                {this.renderSodkuSquare(4+(9*i))}
                {this.renderSodkuSquare(5+(9*i))}
                {this.renderSodkuSquare(6+(9*i))}
                {this.renderSodkuSquare(7+(9*i))}
                {this.renderSodkuSquare(8+(9*i))}
            </tr>
        );
    }

    render(){
        return(
            <div className="Sudoku">
                <table>
                <colgroup><col></col><col></col><col></col></colgroup>
                <colgroup><col></col><col></col><col></col></colgroup>
                <colgroup><col></col><col></col><col></col></colgroup>
                    <tbody>
                        {this.renderSodkuRow(0)}
                        {this.renderSodkuRow(1)}
                        {this.renderSodkuRow(2)}
                    </tbody>
                    <tbody>
                        {this.renderSodkuRow(3)}
                        {this.renderSodkuRow(4)}
                        {this.renderSodkuRow(5)}
                    </tbody>
                    <tbody>
                        {this.renderSodkuRow(6)}
                        {this.renderSodkuRow(7)}
                        {this.renderSodkuRow(8)}
                    </tbody>
                </table>
            </div>
        );
    }
}
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                    squares: puzzle
            }],
            stepNumber: 0,
        };
    }
    handleChange(event) {
        const eventID = event.target.id;
        const eventVal = event.target.value;
        //fix 1: Abort Change event if invalid charcter is enterd. Invalid charcters are turned to "" as a result of singleDigitsOnly(id);
        if(eventVal === "") return;
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length -1];
        const squares = current.squares.slice();
        if(calculateWinner(squares)){
            return;
        }
        
        squares[eventID] = parseInt(eventVal);
        this.setState({
            history: history.concat([
                {squares: squares}
            ]),
            stepNumber: history.length
        });
    }
    jumpTo(step) {
        var history = this.state.history;
        var move = history[step].squares;
        for(var i=0; i < 81; i++){
            var sq = document.getElementById(i);
            sq.value=move[i];
        }
        this.setState({
            stepNumber: step
        })
    }
    CheatButton(){
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length -1];
        const squares = current.squares.slice();
        for(var i=1; i < 81; i++){
            var sq= document.getElementById(i);
            if (i === exception){
                console.log("Exception Reached");
                squares[i] = puzzle[i];
                sq.value=puzzle[i];
            }else {
                squares[i] = solution[i];
                sq.value=solution[i];
            }
        }
        this.setState({
            history: history.concat([
                {squares: squares}
            ]),
            stepNumber: history.length
        });
    }
    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            var desc = move ? 
                //Fix 2: showing current move;
                ((move === history.length-1) ?
                'Go to move #' + move + ' (current)' : 'Go to move #' + move ) :
                'Go to game start';
            return (
                <li key ={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = "Completed!";
        } else{
            status = "Not complete...";
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onChange={ (e) => this.handleChange(e)}
                    />
                </div>
                <div className="game-info">
                    <button onClick={() => this.CheatButton()}>Complete most of puzzle</button>
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================
function findException(){
    var j;
    for (j = 0; j < solution.length; j++){
        if (puzzle[j] !== solution[j]){
            break;
        }
    }
    return j;
}

ReactDOM.render(<Game />, document.getElementById("root"));

function ArrayEquals(arr1,arr2){
    if(arr1.length !== arr2.length) return false;
    for(var i =0; i < arr1.length; i++){
        if(arr1[i] !== arr2[i]) return false;
    }
    return true;
}
function calculateWinner(squares) {
    if(ArrayEquals(squares,solution)){
        var gameboard = document.getElementsByClassName("game-board");
        gameboard[0].setAttribute("id", "complete");
        console.log("Game Completed");
        return true;
    } else{
        var board = document.getElementById("complete");
        if(board!==null){
            board.id="incomplete";
        }
        console.log("Game not Complete");
        return null;
    }
}