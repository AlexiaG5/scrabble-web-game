let placedTiles = [];
let computerPlacedTiles = [];
let firstTurn = true;
let tileBag = [];
let playerTiles = [];
let computerTiles =[];
let currentRound = 1;
let totalScore = 0;
let computerScore = 0
let currentTurn = "player"
let gameOver = false;

let dictionary = new Set();
const wordDefinitions = new Map();
window.wordDefinitions = wordDefinitions;
let letterScores = {};
window.gaddag = null;

import { 
  playTilePlacedSound,
  startGameMusic
} from './soundAndOther.js';

import { 
  createGADDAG, 
  findPossibleWords 
} from "./computerMoveGen.js";

// Load dictionary file
fetch('wordDictionary.txt')
  .then(response => response.text())
  .then(text => {
    text.split('\n').forEach(line => {
      // split up the text file
      const parts = line.split('|');
      const word = parts[0].toUpperCase();
      const wordCategory = parts[1];
      const definition = parts[2];
      const link = parts[3];

      dictionary.add(word);
      window.wordDefinitions.set(word, {
        wordCategory,
        definition,
        link
      });
    });
    // Create the GADDAG
    console.log(" Dictionary passed to GADDAG:", dictionary);
    createGADDAG(dictionary);
    console.log("GADDAG created:", gaddag);
    
  })
  .catch(error => {
    console.error("Error loading dictionary:", error);
});

// Load letters file
fetch('letters.txt')
  .then(response => response.text())
  .then(data => {
    let lines = data.trim().split("\n").slice(1);
    lines.forEach(line => {
      let [letter, score, amount] = line.split(" ");
      score = parseInt(score);
      amount = parseInt(amount);
      letterScores[letter] = score;

      for (let i = 0; i < amount; i++) {
        tileBag.push({ letter, score });
      }
    });

    // Start the game
    startGame();
    startGameMusic();
  });

// Create the board
const board = document.getElementById('board');
const centerRow = 7;
const centerCol = 7;

// Show the bonus squares
const bonusSquares = [
    [4, 0, 0, 1, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 4],
    [0, 3, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 3, 0],
    [0, 0, 3, 0, 0, 0, 1, 0, 1, 0, 0, 0, 3, 0, 0],
    [1, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 1],
    [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
    [4, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 4],
    [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0],
    [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
    [1, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 1],
    [0, 0, 3, 0, 0, 0, 1, 0, 1, 0, 0, 0, 3, 0, 0],
    [0, 3, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 3, 0],
    [4, 0, 0, 1, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 4]
];
  
// Bonus types for the grid
const bonusClassMap = {
    0: '',            // Normal square
    1: 'double-letter',
    2: 'triple-letter',
    3: 'double-word',
    4: 'triple-word'
};

// Generate the grid
function setupBoard(){
  board.innerHTML = '';

  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      // Create a new tile
      const cell = document.createElement('div');
      cell.classList.add('board-cell');
      cell.setAttribute('data-row', row);
      cell.setAttribute('data-col', col);
  
      // Get the bonus type for a square
      const bonusType = bonusSquares[row][col];
  
      if (bonusClassMap[bonusType]) {
        cell.classList.add(bonusClassMap[bonusType]);
      }
  
      // Text for the bonus tiles
      switch (bonusType) {
        case 1:
          cell.innerText = 'DL'; // Double Letter
          break;
        case 2:
          cell.innerText = 'TL'; // Triple Letter
          break;
        case 3:
          cell.innerText = 'DW'; // Double Word
          break;
        case 4:
          cell.innerText = 'TW'; // Triple Word
          break;
      }

      // Drag and drop for the board
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.ondrop = drop;
      cell.ondragover = allowDrop;
      cell.addEventListener('dragover', allowDrop);
      cell.addEventListener('drop', drop);
  
      // Append the tile to the board
      board.appendChild(cell);
    }
  }
}

// Create the board with data not the html elements so it can be used later
const boardData = Array.from({length: 15}, () => Array(15).fill(null));
window.boardData = boardData;

// Create the player rack
const tileRack = document.getElementById('tile-rack');

function updateTileRack() {
  // If game is over remove tiles from rack
  if (gameOver) {
    tileRack.innerHTML = '';
    return;
  }

  tileRack.innerHTML = '';

  playerTiles.forEach((tileObj, index) => {
      const tile = document.createElement('div');
      tile.classList.add('draggable-tile');
      tile.innerText = tileObj.letter;
      tile.setAttribute('draggable', 'true');

      // Assign unique ID to each tile
      tile.id = `tile-${index}`;
      tile.dataset.letter = tileObj.letter;
      tile.dataset.source = 'rack';

      // Add event listener for dragging from the rack
      tile.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', tile.id);
          e.dataTransfer.setData('source', 'rack');
      });

      tileRack.appendChild(tile);
  });
}

// Allow the tiles to be dragged and dropped
function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();

  const tileId = event.dataTransfer.getData('text/plain');
  const source = event.dataTransfer.getData('source');
  const tile = document.getElementById(tileId);
  const targetCell = event.target.closest('.board-cell');

  if (!tile || !targetCell || !targetCell.classList.contains('board-cell')) return;

  const hasTile = targetCell.querySelector('.draggable-tile') !== null;
  const row = parseInt(targetCell.dataset.row);
  const col = parseInt(targetCell.dataset.col);

  // Check if the cell is occupied already
  if (hasTile){
    return;
  }else{
    playTilePlacedSound();
  }

  if (firstTurn) {
    const isInCenterRow = row === centerRow;
    const isInCenterCol = col === centerCol;
    if (!isInCenterRow && !isInCenterCol) {
      showError("On the first turn, tiles must be placed in the center row or column!");
      return;
    }
  }

  if (source === 'rack') {
    // Clone tile to keep rack version intact
    const newTile = tile.cloneNode(true);
    newTile.dataset.source = 'board'; // Mark as placed
    newTile.draggable = true;
    newTile.id = `placed-${row}-${col}`;

    // Add event listener for dragging from the board
    newTile.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', newTile.id);
      e.dataTransfer.setData('source', 'board');
    });

    targetCell.appendChild(newTile);
    tile.remove();

    // Add to placedTiles for tracking
    placedTiles.push({ row, col, letter: newTile.dataset.letter });

    // Remove the tile from playerTiles
    const tileLetter = tile.dataset.letter;
    const tileIndex = playerTiles.findIndex(t => t.letter === tileLetter);
    if (tileIndex !== -1) {
      playerTiles.splice(tileIndex, 1);
    }

    boardData[row][col] = tileLetter; // Update boardData element

    updateTileRack(); // Refresh rack after placing a tile

    // Validate first turn placement, validate word and clear the error messages
    validateFirstTurn();
    validateConnections() // Shows the score and the green/red if the word is valid
    clearError();
    
  } else if (source === 'board') {
    // Allow tiles to be moved on the board
    const prevCell = tile.parentElement;
    prevCell.removeChild(tile); // Remove tile from previous spot
    targetCell.appendChild(tile); // Place in new spot

    // Remove tile from previous spot
    boardData[prevRow][prevCol] = null;
    // Place in new spot
    boardData[row][col] = tile.dataset.letter;

    // Update tile position in placedTiles
    let tileData = placedTiles.find(t => t.row === parseInt(prevCell.dataset.row) && t.col === parseInt(prevCell.dataset.col));
    if (tileData) {
      tileData.row = row;
      tileData.col = col;
    }
  }
}

setupBoard();

// What happens at the start of the game
function startGame() {
  playerTiles = drawTiles(7);
  computerTiles = drawTiles(7);
  console.log("Computer's Tile Rack:", computerTiles);
  updateTileRack();
  updateRoundDisplay();
  setActiveTurn(true);
  showTileBagSummary(showTileBag(tileBag));
}

// Update tile bag
function drawTiles(count) {
  let drawnTiles = [];
  for (let i = 0; i < count; i++) {
    if (tileBag.length === 0) break; // No tiles left in the bag
    let randomIndex = Math.floor(Math.random() * tileBag.length);
    drawnTiles.push(tileBag.splice(randomIndex, 1)[0]); // Remove tiles drawn from tile bag
  }
  return drawnTiles;
}

// Show the remaining letters in the tile bag
function showTileBag(tileBag) {
  const summary = {};

  tileBag.forEach(tile => {
    const letter = tile.letter;
    summary[letter] = (summary[letter] || 0) + 1;
  });

  // Sort alphabetically
  const sorted = Object.keys(summary).sort().reduce((obj, key) => {
    obj[key] = summary[key];
    return obj;
  }, {});

  return sorted;
}

const summary = showTileBag(tileBag);

// Update html element
function showTileBagSummary(summary) {
  const container = document.getElementById("tile-bag-summary");
  container.innerHTML = "";

  for (let letter in summary) {
    const tile = document.createElement("div");
    tile.textContent = `${letter} × ${summary[letter]}`;
    container.appendChild(tile);
  }
}

// Update round number
function updateRoundDisplay() {
  const roundDisplay = document.getElementById("round-number");

  if (roundDisplay) {
    roundDisplay.innerHTML = `<strong>Current Round:</strong> ${currentRound}`;
  } else {
      console.error("Element #round-number not found!");
      return;
  }
}

// Next turn logic
function nextTurn() {
  
  // Lock placed tiles so they cannot be moved
  placedTiles.forEach(({ row, col }) => {
    const cell = document.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
      let tile = cell.querySelector('.draggable-tile');
      if (tile) {
        tile.draggable = false; // Prevent further movement
      }
    }
  });

  // Show the definition of word played
  showDefinition()

  // Remove placed tiles from the rack and refill it
  updateTileRack();

  // Reset placed tiles for next turn
  placedTiles = [];

  // Clear the displayed score after submission
  document.querySelectorAll('.score-bubble').forEach(bubble => bubble.remove());

  // Update round counter
  currentRound++;
  updateRoundDisplay();
  console.log("Turn complete, new tiles drawn.");
}

// Submit button stuff

// Remove red and green outline after submit button is pressed
function clearBoardHighlights() {
  document.querySelectorAll('.board-cell').forEach(cell => {
    cell.style.outline = ''; // Remove red/green outlines
  });
}

// What happens when the user presses the submit button
document.getElementById('submit-word-btn').addEventListener('click', function() {
  const word = getPlacedWord(); // Function that retrieves the placed word from the board

  // Check if its the players turn
  if (currentTurn !== "player") {
    showError("It is not your turn!");
    return;
  }

  if (firstTurn) {
    // Check if at least one tile is in the middle on the first turn
    const hasCenterTile = placedTiles.some(t => t.row === centerRow && t.col === centerCol);
    if (!hasCenterTile) {
        showError("On the first turn, you must place at least one tile in the center!");
        return; 
    }
  } else {
      // Check that tiles are connected or validate connections
      if (!word || !validateConnections()) {
          showError("You must place the tiles next to each other");
          return;
      }
  }

  if (validateConnections()  &&  validateAndScoreWord(true)) {
    firstTurn = false; 
    currentTurn = "computer";
    setActiveTurn(false);
    setTimeout(computerMove, 1000);

    // Remove placed tiles from player's rack
    placedTiles.forEach(tile => {
      let index = playerTiles.findIndex(t => t.letter === tile.letter);
      if (index !== -1) playerTiles.splice(index, 1);
    });

    // Draw new tiles
    let newTiles = drawTiles(7 - playerTiles.length);
    playerTiles = [...playerTiles, ...newTiles];

    // Proceed to next turn and update the round and tile rack
    nextTurn();
    updateTileRack();
    updateRoundDisplay();
    showTileBagSummary(showTileBag(tileBag));
    placedTiles = [];

    clearBoardHighlights(); // Remove red outlines after submission
  }else{
    console.log("Submission failed due to incorrect word or placement");
  }
});

// Tile validations !!

// First Turn Validation
function validateFirstTurn() {
  const centerTileIncluded = placedTiles.some(tile => tile.row === centerRow && tile.col === centerCol);

  placedTiles.forEach(({ row, col }) => {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`); // Fix selector
    if (!cell) return; // Avoid errors

    if (centerTileIncluded) {
      cell.style.outline = '3px solid red'; // Valid move
    } else {
      cell.style.outline = '3px solid red'; // Invalid move
    }
  });

  // Prevent ending the first turn until a tile is placed in the center
  if (centerTileIncluded) {
    firstTurn = false;
  }
}

// Check if all the tiles are connected
function validateConnections() {
  if (placedTiles.length === 0) return false; // No tiles placed

  // Check if it's the first turn
  if (firstTurn) {
    // Ensure at least one tile is placed in the center
    const hasCenterTile = placedTiles.some(t => t.row === centerRow && t.col === centerCol);
    if (!hasCenterTile) {
      showError("On the first turn, you must place at least one tile in the center!");
      return false;
    }

    // If it is the first turn and the center tile condition is met, return true for further checks
    firstTurn = false;
    return true;
  }

  // Subsequent Turns - Ensure that placed tiles connect to the existing word
  const boardCells = document.querySelectorAll('.board-cell'); // All cells on the board
  let connected = false;

  // Check if the newly placed tiles are adjacent to any existing tile (horizontally or vertically)
  for (const { row, col } of placedTiles) {
    // Check each cell for adjacency to any of the placed tiles
    for (const cell of boardCells) {
      const cellRow = parseInt(cell.dataset.row);
      const cellCol = parseInt(cell.dataset.col);

      // Check if the placed tile is adjacent to any existing tile (horizontally or vertically)
      if (
        (Math.abs(row - cellRow) === 1 && col === cellCol) || // Adjacent row (vertical)
        (Math.abs(col - cellCol) === 1 && row === cellRow)    // Adjacent column (horizontal)
      ) {
        connected = true;
        break; // Break if any tile is connected
      }
    }

    // Break early if connection is found for any placed tile
    if (connected) break;
  }

  // If no connection was found, show an error message
  if (!connected) {
    showError("Each new tile must connect to an existing word!");
    return false;
  }

  // Apply green outline for valid connection
  placedTiles.forEach(({ row, col }) => {
    const cell = document.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
    cell.style.outline = connected && validateAndScoreWord(false) ? '3px solid green' : '3px solid red';
  });

  return true;
}

// Display error messages on the page
function showError(message) {
  const errorMessageElement = document.getElementById("error-message");
  errorMessageElement.textContent = message;
  errorMessageElement.style.display = "block";  // Make sure it's visible
}

// Hide the error message
function clearError() {
  const errorMessageElement = document.getElementById('error-message');
  errorMessageElement.style.display = 'none';  // Hide the error message
}

// Word validation - check against dictionary

// Create the word from the tiles placed
function getPlacedWord() {
  if (placedTiles.length === 0) return null;

  let firstTile = placedTiles[0];
  let row = firstTile.row;
  let col = firstTile.col;

  // Check if the word is horizontal or vertical
  let isHorizontal = placedTiles.every(tile => tile.row === row);
  let isVertical = placedTiles.every(tile => tile.col === col);

  if (!isHorizontal && !isVertical) {
    showError("Tiles must be placed in a straight line!");
    return null;
  }

  let word = '';

  // Get a letter from a given cell
  function getLetter(r, c) {
    let tile = document.querySelector(`.board-cell[data-row="${r}"][data-col="${c}"]`)?.querySelector('.draggable-tile');
    return tile ? tile.dataset.letter : null;
  }

  if (isHorizontal) {
      let startCol = col;
      let endCol = col;

      // Move left to find the start of the word
      while (getLetter(row, startCol - 1)) startCol--;

      // Move right to find the end of the word
      while (getLetter(row, endCol + 1)) endCol++;

      // Build the word from startCol to endCol
      for (let c = startCol; c <= endCol; c++) {
          let letter = getLetter(row, c);
          if (letter) word += letter;
      }
  } 
  else if (isVertical) {
      let startRow = row;
      let endRow = row;

      // Move up to find the start and endof the word
      while (getLetter(startRow - 1, col)) startRow--;

      // Move down to find the end of the word
      while (getLetter(endRow + 1, col)) endRow++;

      // Build the word from startRow to endRow
      for (let r = startRow; r <= endRow; r++) {
          let letter = getLetter(r, col);
          if (letter) word += letter;
      }
  }

  return word.length > 1 ? word : null; // Only return if the word is at least 2 letters
}

// Validate word and calculate score
function validateAndScoreWord(isFinalSubmission = false) {
  let word = getPlacedWord();
  let wordMultiplier = 1;
  let score = 0;
  const allTilesInWord = new Set(); // To store all the tiles in the word

  let isValid = dictionary.has(word);
  
  if (!isValid) {
    showError(`"${word}" is not a valid word!`);
    showScore(null, false);
    return false;
  }

  // Update the score of the placed tiles
  for (let tile of placedTiles) {
  const { row, col, letter } = tile;

  let letterScore = letterScores[letter] || 0;

  // Check the bonus squares
  const bonusType = bonusSquares[row][col];
  const bonusClass = bonusClassMap[bonusType];

  // Apply letter bonuses if the sqaure is a letter bonus
  if (bonusClass === 'double-letter') {
    letterScore *= 2;
  } else if (bonusClass === 'triple-letter') {
    letterScore *= 3;
  }

  score += letterScore;

  // Apply word bonuses
  if (bonusClass === 'double-word') {
    wordMultiplier *= 2;
  } else if (bonusClass === 'triple-word') {
    wordMultiplier *= 3;
  }
  }

  score *= wordMultiplier;

  // Update total score
  if (isFinalSubmission) {
    totalScore += score;
    updateTotalScore();
  }

  console.log(`Word "${word}" is valid! Score: ${score}`);
  showScore(score, isValid);
  return true;
} 

// Show the score on the UI
function showScore(score, isValid){
  if (placedTiles.length === 0) return; // No tiles placed

  // Sort tiles to find the first tile (leftmost if horizontal, topmost if vertical)
  placedTiles.sort((a, b) => (a.row === b.row ? a.col - b.col : a.row - b.row));
  let firstTile = placedTiles[0];

  // Find the first tile's cell
  let cell = document.querySelector(`.board-cell[data-row="${firstTile.row}"][data-col="${firstTile.col}"]`);
  if (!cell) return;
  
  let existingScoreBubble = cell.querySelector('.score-bubble');

  // If the word is invalid, remove the entire score bubble element
  if (!isValid && existingScoreBubble) {
    existingScoreBubble.remove();
    return;
  }

   // If the word is valid, update the score inside the existing bubble or create one if none exists
   if (isValid && score !== null) {
    if (existingScoreBubble) {
      existingScoreBubble.innerText = score;
    } else {
      // If there's no existing score create a new score bubble
      let scoreBubble = document.createElement('div');
      scoreBubble.classList.add('score-bubble');
      scoreBubble.innerText = score;

      cell.appendChild(scoreBubble);  
    }
  }
}

// Update total score UI
function updateTotalScore() {
  const scoreElement = document.getElementById("total-score");
  const computerScoreElement = document.getElementById("computer-score");

  if (scoreElement) {
    scoreElement.innerText = `Total Score: ${totalScore}`;
  }
  
  if (computerScoreElement){
    computerScoreElement.innerText = `Total Score: ${computerScore}`;
  }
}

// Show the defintion of the word
function showDefinition(word = null) {
  if (!word) {
    word = getPlacedWord();
  }

  // Show on the screen
  if (wordDefinitions.has(word)) {
    const { wordCategory, definition, link } = wordDefinitions.get(word);
    const definitionBox = document.getElementById('definition');
    definitionBox.style.display = "block";  // Make it visible
    definitionBox.innerHTML = `
      <strong>${word}</strong> (${wordCategory})<br>
      ${definition}<br>
      <a href="${link}" target="_blank">Read more</a>
    `;
  } else {
    console.warn(`No definition found for ${word}`);
  }
}

// Open and close resign popup

// Get elements
const modal = document.getElementById("gameOverPopup");
const btn = document.getElementById("resign");
const closeBtn = document.getElementById("close");

// Open modal when button is clicked
btn.addEventListener("click", function () {
    modal.style.display = "flex"; // Show the modal
    endGame();
});

// Close modal when "X" is clicked
closeBtn.addEventListener("click", function () {
    modal.style.display = "none"; // Hide the modal
});

// Close modal if user clicks outside of the modal content
window.addEventListener("click", function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// End game popup information
function endGame() {
  const rounds = currentRound;
  const playerScore = totalScore;

  // Create the summary
  const summary = `
    <p>Player Score:<strong> ${playerScore}</strong></p>
    <p>Computer Score:<strong> ${computerScore}</strong></p> 
    <p>Total Rounds:<strong> ${rounds}</strong></p>
  `;

  // Insert the generated summary into the modal content
  document.getElementById('gameSummary').innerHTML = summary;

  // Stop game logic here
  gameOver = true;
  updateTileRack(); // Trigger the rack update
  clearError();
  document.getElementById('submit-word-btn').disabled = true;
}

// Show turn by updating star element
function setActiveTurn(isPlayerTurn) {
  // Reset both stars
  document.getElementById('player-turn').classList.remove('active');
  document.getElementById('computer-turn').classList.remove('active');

  // Add the active class to the correct turn
  if (isPlayerTurn) {
      document.getElementById('player-turn').classList.add('active'); // Player's turn
  } else {
      document.getElementById('computer-turn').classList.add('active'); // Computer's turn
  }
}

// Computer ----

function calculateComputerScore(computerPlacedTiles) {
  let wordMultiplier = 1;
  let score = 0;

  // Loop through computer placed tiles
  for (let tile of computerPlacedTiles) {
    const { row, col, letter } = tile;

    let letterScore = letterScores[letter] || 0;

    // Check bonus squares
    const bonusType = bonusSquares[row][col];
    const bonusClass = bonusClassMap[bonusType];

    // Apply letter bonuses
    if (bonusClass === 'double-letter') {
      letterScore *= 2;
    } else if (bonusClass === 'triple-letter') {
      letterScore *= 3;
    }

    score += letterScore;

    // Apply word bonuses
    if (bonusClass === 'double-word') {
      wordMultiplier *= 2;
    } else if (bonusClass === 'triple-word') {
      wordMultiplier *= 3;
    }
  }

  score *= wordMultiplier;

  console.log(`Computer scored: ${score} points`);

  computerScore += score;
  updateTotalScore();
  return score;
}

// Refill the computers tiles
function refillComputerTiles(){
  let newTiles = drawTiles(7 - computerTiles.length);
  computerTiles = [...computerTiles, ...newTiles];
  console.log("Computer's Tile Rack:", computerTiles);
}

// Computer move generation

function computerMove() {
  console.log("Computer's turn...");
  let bestMove = findBestMove(computerTiles, window.boardData);
  
  if (!bestMove) {
      console.log("Computer has no valid move!");
      currentTurn = "player";
      setActiveTurn(true);
      currentRound++;
      updateRoundDisplay();
      console.log("Turn complete, Player's turn now");
      return;
  }

  placeWordOnBoard(bestMove.word, bestMove.position); // Play the word
  calculateComputerScore(computerPlacedTiles); // Calculate the score the word

  // Switch to next turn and update game data
  refillComputerTiles();
  console.log("Computer played:", bestMove.word);
  currentRound++;
  updateRoundDisplay();
  showDefinition(bestMove.word);
  currentTurn = "player"; // Switch back to player turn
  setActiveTurn(true);
  console.log("Turn complete, Player's turn now");
}

function findBestMove(tiles) {

  // Convert tile objects to an array of letters
  let tileLetters = tiles.map(tile => tile.letter);
  console.log("Computer's available letters:", tileLetters);

  // Get all possible words using GADDAG
  let possibleWords = findPossibleWords(tileLetters, window.gaddag, window.boardData);
  console.log("Possible words:", possibleWords);

  if (possibleWords.length === 0){
    console.log("No valid moves");
    return null;
  }

  // Right now it picks the longest word
  let bestWord = possibleWords.reduce((a, b) => (a.length >= b.length ? a : b));

  return { word: bestWord, position: findBestPosition(bestWord) };
}

function findBestPosition(word) {
  for (let row = 0; row < boardData.length; row++) {
    for (let col = 0; col < boardData[row].length; col++) {
      const boardLetter = boardData[row][col];

      if (boardLetter !== null && boardLetter !== "") {
        // Try matching each letter of the word to this board letter
        for (let i = 0; i < word.length; i++) {
          if (word[i] === boardLetter) {
            // Try placing horizontally
            let startCol = col - i;
            if (startCol >= 0 && startCol + word.length <= 15) {
              let canPlace = true;
              for (let j = 0; j < word.length; j++) {
                let cell = boardData[row][startCol + j];
                if (cell !== null && cell !== "" && cell !== word[j]) {
                  canPlace = false;
                  break;
                }
              }
              if (canPlace) {
                return { row: row, col: startCol, direction: 'horizontal' };
              }
            }

            // Try placing vertically
            let startRow = row - i;
            if (startRow >= 0 && startRow + word.length <= 15) {
              let canPlace = true;
              for (let j = 0; j < word.length; j++) {
                let cell = boardData[startRow + j][col];
                if (cell !== null && cell !== "" && cell !== word[j]) {
                  canPlace = false;
                  break;
                }
              }
              if (canPlace) {
                return { row: startRow, col: col, direction: 'vertical' };
              }
            }
          }
        }
      }
    }
  }

  // If no good spot found, default to top-left
  return { row: 0, col: 0, direction: 'horizontal' };
}

function placeWordOnBoard(word, position) {
  const { row, col, direction } = position;

  console.log(`Placing word: ${word} at row: ${row}, col: ${col}, direction: ${direction}`);
  console.log("Board Data BEFORE placing word:", boardData);

  computerPlacedTiles = []; // reset the placed tiles of the computer

  for (let i = 0; i < word.length; i++) {
    const currentRow = direction === 'horizontal' ? row : row + i;
    const currentCol = direction === 'horizontal' ? col + i : col;

    // Update the boardData element
    boardData[currentRow][currentCol] = word[i];

    // Track computers placed tiles
    computerPlacedTiles.push({ row: currentRow, col: currentCol, letter: word[i] });

    // Update the visual board
    const selector = `.board-cell[data-row="${currentRow}"][data-col="${currentCol}"]`;
    const targetCell = document.querySelector(selector);

    if (targetCell) {
      targetCell.innerHTML = '';

      const tileDiv = document.createElement('div');
      tileDiv.classList.add('draggable-tile');
      tileDiv.dataset.letter = word[i];
      tileDiv.innerText = word[i];
      tileDiv.draggable = false;

      targetCell.appendChild(tileDiv);
    }
  }
}