import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

let counter = 0;    // counts the number of spaces made
let start = true;   // indicates if a new board is being created

// a function component that takes in a value which will represent its spot on the board
function Space(props) {
  return (
    <button className="space" onClick={props.onClick}>
        {props.value}
    </button>
  );
}

// a board to contain and manipulate spaces
class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      size: this.props.size,
    };
  }

  // fills every space in the board with 'B'
  newBoard() {
    let N = this.state.size;
    let S = N*N;
    for (let i = 0; i < S; i++) {
      this.props.spaces[i] = 'B';
    }
    start = false;
  }
  
  // makes a space with a value i
  renderSpace(i) {
    return (
      <Space 
        key={i}
        value={this.props.spaces[i]}
        onClick={() => this.props.onClick(i)}
      />
    ); 
  }

  // render a single row of spaces
  renderRow() {
    let N = this.state.size;
    let row = []
    
    for (let i = 0; i < N; i++, counter++) {
        row.push(this.renderSpace(counter))
    }
    return row
  }

  // render 'size' number of rows
  renderWhole() {
    let N = this.state.size;
    let row = []
    for (let i = 0; i < N; i++) {
        row.push(<div key={i} className="board-row">{this.renderRow()}</div>)
    }
    if (start) {
      this.newBoard(); 
    }
    counter = 0;
    return row
  }

  // renders the whole board with all the spaces
  render() {
    return (
      <div>
        {this.renderWhole()}
      </div>
    );
  }
}

// a class to contain and manipulate the board
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: this.props.history,
      stepNumber: 0,
      size: this.props.size,
      lastClick: this.props.lastClick,
    };
  }

  // creates and returns a number of options for the board size
  getOptions() {
    let options = []
    for (let i = 1; i <= 50; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  }

  // renders the board and history
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const qCount = countQueens(current.spaces, this.state.size);

     
    /* const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}
          </button>
        </li>
      );
    }) */
     
    const undoButton = 
      <button onClick={() => this.jumpTo(this.state.stepNumber-1)}>Undo
      </button>;

    const redoButton = 
      <button onClick={() => this.jumpTo(this.state.stepNumber+1)}>Redo
      </button>;
      
    

    // change board size option list and button
    let changeBoardSize = 
    <div>
      Board Size:&nbsp;&nbsp;
      <select id="size" name="options" size="1" value={this.state.size} onChange={() => this.changeN(document.getElementById('size').value)}>
        {this.getOptions()}
      </select>
      <button id="restart" name="restartButton" onClick={() => this.changeN(document.getElementById('size').value)}>Restart</button>
      <br/><br/>
    </div>;
    
    return (
      <div className="game">
        <div className="game-board">
        <h1>Peaceable Queens</h1>
        {changeBoardSize}
          <Board 
            spaces = {current.spaces}
            onClick = {(i) => this.handleClick(i)}
            size = {this.state.size}
          />
        </div>
        <div className="game-info">
          <br/><br/>
          <div>Board Size: {this.state.size}x{this.state.size}</div>
          <br/>
          <div>{qCount}</div>
          <div>{undoButton}{redoButton}</div>
          <div>{/*moves*/}</div>
        </div>
      </div>
    );
  }

  // start over with a new board of i size
  changeN(i) {
    ReactDOM.unmountComponentAtNode(document.getElementById('root'));
    start = true;
    ReactDOM.render(
      <Game size = {parseInt(i)}  history = {[{
        spaces: Array(i).fill(null),
      }]}/>,
      document.getElementById('root')
    );    
  }

  // add a 'W' on the space that was clicked and eliminate any conflicting 'B' 
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber +1);
    const current = history[history.length-1];
    const spaces = current.spaces.slice();
    const lastClick = this.state.lastClick;
    let N = this.state.size;

    // if last clicked just undo
    if (lastClick === i) {
      this.jumpTo(this.state.stepNumber-1);
      return;
    }

    // if 'W', remove 'W' then add back nonconflicting 'B'
    if (spaces[i] === 'W') {
      
      spaces[i] = null;

      let rowS = N*Math.trunc(i/N);
      let rowE = N* Math.trunc(i/N) + N;
      // check if row can add back 'B'
      for (let S = rowS; S < rowE; S++) {
        if (this.checkSpace(S, spaces)) {
          spaces[S] = 'B';
        }
      }
      // check column
      rowS = i%N;
      rowE = (N*(N-1))+(i%N);
      for (let S = rowS, j = S; S < rowE; S++, j+=N) {
        if (this.checkSpace(j, spaces)) {
          spaces[j] = 'B';
        }
      }

      // check up and left diagonal
      rowE = i%N;
      for (let S = 0, j = i; S <= rowE; S++, j-=N+1) {
        if (this.checkSpace(j, spaces)) {
          spaces[j] = 'B';
        }
      }
      // check down and left diagonal
      for (let S = 0, j = i; S <= rowE; S++, j+=N-1) {
        if (this.checkSpace(j, spaces)) {
          spaces[j] = 'B';
        }
      }
      // check down and right diagonal
      rowE = (N-(i%N))-1;
      for (let S = 0, j = i; S <= rowE && S < N*N; S++, j+=N+1) {
        if (this.checkSpace(j, spaces)) {
          spaces[j] = 'B';
        }
      }
      // check up and right diagonal
      for (let S = 0, j = i; S <= rowE; S++, j-=N-1) {
        if (this.checkSpace(j, spaces)) {
          spaces[j] = 'B';
        }
      }

    } else {

      // if 'B' or empty, place 'W', then remove conflciting 'B'
      spaces[i] =  'W';

      // clear row
      let rowS = N*Math.trunc(i/N);
      let rowE = N*Math.trunc(i/N) + N;
      for (let S = rowS; S < rowE; S++) {
        if (spaces[S] !== 'W') spaces[S] = null;
      }
      // clear column
      rowS = i%N;
      rowE = (N*(N-1))+(i%N);
      for (let S = rowS, j = S; S < rowE; S++, j+=N) {
        if (spaces[j] !== 'W') spaces[j] = null;
      }

      // clear up and left diagonal
      rowE = i%N;
      for (let S = 0, j = i; S <= rowE; S++, j-=N+1) {
        if (spaces[j] !== 'W') spaces[j] = null;
      }
      // clear down and left diagonal
      for (let S = 0, j = i; S <= rowE; S++, j+=N-1) {
        if (spaces[j] !== 'W') spaces[j] = null;
      }
      // clear down and right diagonal
      rowE = (N-(i%N))-1;
      for (let S = 0, j = i; S <= rowE && S < N*N; S++, j+=N+1) {
        if (spaces[j] !== 'W') spaces[j] = null;
      }
      // up and right diagonal
      for (let S = 0, j = i; S <= rowE; S++, j-=N-1) {
        if (spaces[j] !== 'W') spaces[j] = null;
      }
    }

    // update the state to reflect the change
    this.setState({
      history: history.concat([{
        spaces: spaces,
      }]),
      stepNumber: history.length,
      lastClick: i,
    });
  }

  // check a space for conflicts, if no conflicts, add back a 'B'
  checkSpace(i,spaces) {
    // check each space if there are other 'W' attacking this space
    // idea: if I check the row and encounter another 'W' I can stop checking the row etc.

    let N = this.state.size;

    if (spaces[i] === 'W') return false;

    // check row
    let rowS = N*Math.trunc(i/N);
    let rowE = N*Math.trunc(i/N) + N;
    for (let S = rowS; S < rowE; S++) {
      if (spaces[S] === 'W') {
        if (S !== i) return false;
      }
    }

    // check column
    rowS = i%N;
    rowE = (N*(N-1))+(i%N);
    for (let S = rowS, j = S; S < rowE; S++, j+=N) {
      if (spaces[j] === 'W') {
        if (j !== i) return false;
      }
    }

    // check up and left
    rowE = i%N;
    for (let S = 0, j = i; S <= rowE; S++, j-=N+1) {
      if (spaces[j] === 'W') {
        if (j !== i) return false;
      }
    }

    // check down and left
    for (let S = 0, j = i; S <= rowE; S++, j+=N-1) {
      if (spaces[j] === 'W') {
        if (j !== i) return false;
      }
    }

    // check down and right
    rowE = (N-(i%N))-1;
    for (let S = 0, j = i; S <= rowE && S < N*N; S++, j+=N+1) {
      if (spaces[j] === 'W') {
        if (j !== i) return false;
      }
    }

    // check up and right
    for (let S = 0, j = i; S <= rowE; S++, j-=N-1) {
      if (spaces[j] === 'W') {
        if (j !== i) return false;
      }
    }

    // if the space makes it this far, it passed the test, add a 'B'
    return true;
  }

  jumpTo(step,i) {
    if (step < 0) return;
    if (step >= this.state.history.length) return;
    this.setState({
      stepNumber: step,
      lastClick: i,
    })
  }
}

// count the number of spaces with 'W' and 'B'
function countQueens(spaces, N) {
  const S = N*N;
  let B = 0;
  let W = 0;
  for (let i = 0; i < S; i++) {
    if (spaces[i] !== null && spaces[i] === 'W') {
      B++;
    } else if (spaces[i] !== null && spaces[i] === 'B') {
      W++;
    }
  }
  
  return (
    <div>
    W Count: <b>{B}</b> 
    <div>  
    B Count: <b>{W}</b>
    <br/><br/>
    </div>
    </div>
  );
}

// ========================================
// render the game, initial board size 8
ReactDOM.render(
  <Game size = {8} history = {[{
    spaces: Array(8).fill(null),
  }]}/>,
  document.getElementById('root')
);
