let origBoard;
let wins = 0;
let ties = 0;
let losses = 0;
let huPlayer = "◯";
let aiPlayer = "╳";
let endGame = document.querySelector(".endgame");
let selectSym = document.querySelector(".selectSym");
const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 4, 8],
  [6, 4, 2],
  [2, 5, 8],
  [1, 4, 7],
  [0, 3, 6],
];

const cells = document.querySelectorAll(".cell");
const win = document.querySelector(".win");
const lose = document.querySelector(".lose");
const tie = document.querySelector(".tie");
const open = document.querySelector(".open");
const options = document.querySelector(".options");
let count = 1;
open.addEventListener("click", () => {
  options.style.top = count % 2 === 1 ? "50%" : "-100%";
  options.style.transition = "all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);";
  count++;
});
let symbolSelected = false;
startGame();

function startGame() {
  endGame.style.opacity = "0";
  selectSym.style.opacity = "1";

  origBoard = Array.from(Array(9).keys());
  for (let i = 0; i < cells.length; i++) {
    cells[i].innerHTML = "";
    cells[i].style.removeProperty("color");
    cells[i].addEventListener("click", turnClick, false);
    cells[i].classList.remove("symbol");
  }
  win.innerText = wins;
  lose.innerText = losses;
  tie.innerText = ties / 2;
}

function selectSym(sym) {
  options.classList.remove("show");
  huPlayer = sym;
  aiPlayer = sym === "◯" ? "╳" : "◯";
  if (aiPlayer === "╳") {
    turn(bestSpot(), aiPlayer);
  }
  selectSym.style.opacity = "0";
  symbolSelected = true;
}
let isAIsTurn = false;

function turnClick(square) {
  if (isAIsTurn || typeof origBoard[square.target.id] !== "number") {
    return;
  }

  isAIsTurn = true;

  setTimeout(() => {
    turn(square.target.id, huPlayer);
    if (!checkWin(origBoard, huPlayer) && !checkTie()) {
      setTimeout(() => {
        turn(bestSpot(), aiPlayer);
        isAIsTurn = false;
      }, 500);
    } else {
      isAIsTurn = false;
    }
  }, 0);
  selectSym.style.opacity = "0";
}

function turn(squareId, player) {
  origBoard[squareId] = player;
  let cell = document.getElementById(squareId);
  let symbol = document.createElement("div");
  if (player === "╳") {
    symbol.style.fontSize = "30px";
  } else {
    symbol.style.fontSize = "40px";
  }
  symbol.innerText = player;
  symbol.classList.add("symbol"); // Add the 'symbol' class to the new element
  cell.appendChild(symbol);
  let gameWon = checkWin(origBoard, player);
  if (gameWon) gameOver(gameWon);
  checkTie();
}

function checkWin(board, player) {
  let plays = board.reduce((a, e, i) => (e === player ? a.concat(i) : a), []);
  let gameWon = null;
  for (let [index, win] of winCombos.entries()) {
    if (win.every((elem) => plays.indexOf(elem) > -1)) {
      gameWon = { index: index, player: player };
      break;
    }
  }
  return gameWon;
}

function gameOver(gameWon) {
  for (let index of winCombos[gameWon.index]) {
    document.getElementById(index).style.color =
      gameWon.player === huPlayer ? "#D3D3C2" : "#800000";
  }
  for (let i = 0; i < cells.length; i++) {
    cells[i].removeEventListener("click", turnClick, false);
  }
  declareWinner(gameWon.player === huPlayer ? "You win!" : "You lose");
}

function declareWinner(who) {
  endGame.style.opacity = "1";

  if (who === "You win!") {
    wins++;
  } else if (who === "You lose") {
    losses++;
  } else {
    ties++;
  }
}

function emptySquares() {
  return origBoard.filter((elm, i) => i === elm);
}

function bestSpot() {
  return minimax(origBoard, aiPlayer).index;
}

function checkTie() {
  if (emptySquares().length === 0) {
    for (let cell of cells) {
      cell.style.color = "#F0E68C";
      cell.removeEventListener("click", turnClick, false);
    }
    declareWinner("Tie game");
    return true;
  }
  return false;
}

function minimax(newBoard, player) {
  var availSpots = emptySquares(newBoard);

  if (checkWin(newBoard, huPlayer)) {
    return { score: -10 };
  } else if (checkWin(newBoard, aiPlayer)) {
    return { score: 10 };
  } else if (availSpots.length === 0) {
    return { score: 0 };
  }

  var moves = [];
  for (let i = 0; i < availSpots.length; i++) {
    var move = {};
    move.index = newBoard[availSpots[i]];
    newBoard[availSpots[i]] = player;

    if (player === aiPlayer) move.score = minimax(newBoard, huPlayer).score;
    else move.score = minimax(newBoard, aiPlayer).score;
    newBoard[availSpots[i]] = move.index;
    if (
      (player === aiPlayer && move.score === 10) ||
      (player === huPlayer && move.score === -10)
    )
      return move;
    else moves.push(move);
  }

  let bestMove, bestScore;
  if (player === aiPlayer) {
    bestScore = -1000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    bestScore = 1000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}
