export {};
/*
  tictactoe.js - The game logic for Tic Tac Toe
  This file:
    1. Finds the page elements it needs.
    2. Keeps track of the game (the board, whose turn it is, the player names).
    3. Handles moves, checks for a win or a draw, and plays sounds.
    4. Connects buttons and forms to the functions using event listeners.
*/

// ---- 1. Get the elements from the page ----
// I store these in constants at the start so I don't have to search the page every time I need them.
// querySelectorAll gives a list of all 9 square buttons, in the same order as in the HTML (0 to 8).
const squares = document.querySelectorAll<HTMLButtonElement>('.square');
const playerForm = document.getElementById('player-form') as HTMLFormElement;
const statusText = document.getElementById('status') as HTMLInputElement;
const restartButton = document.getElementById('restart') as HTMLButtonElement;
const changeButton = document.getElementById('change-players') as HTMLButtonElement;
const soundCheckbox = document.getElementById('sound') as HTMLInputElement;


// ---- 2. Game state (variables that change while playing) ----
// The board is an array of 9 strings, one for each square. '' means empty, otherwise 'X' or 'O'.
// Square positions:   0 | 1 | 2
//                     3 | 4 | 5
//                     6 | 7 | 8
let board = ['', '', '', '', '', '', '', '', ''];
// X always goes first.
let currentPlayer = 'X';
// false before the game starts and after it ends, so clicks are ignored at those times.
let playing = false;
// The names typed into the form.
let playerX = '';
let playerO = '';
// Every possible way to win: 3 rows, 3 columns and 2 diagonals.
// Each inner array holds the three board positions that make a line.
// It's a const because the winning lines never change.
const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], 
  [0, 3, 6], [1, 4, 7], [2, 5, 8], 
  [0, 4, 8], [2, 4, 6]             
];

// ---- 3. Functions ----

// Returns the name of the player whose turn it is, so messages can use real names instead of "X" or "O".
function playerName() {
  if (currentPlayer === 'X') return playerX;
  return playerO;
}

// Plays one sound effect, using the id of an <audio> element.
function playSound(id: string) {
  // If the sound box is not ticked, stop here and play nothing.
  if (!soundCheckbox.checked) return;
  const audio = document.getElementById(id) as HTMLAudioElement;
  // Go back to the start, so the sound plays fully even if it was played a moment ago.
  audio.currentTime = 0;
  // play() can fail (e.g. the file is missing or the browser blocks it).
  // .catch() handles that error and shows a message instead of breaking the game.
  audio.play().catch(function () {
    document.getElementById('sound-message')!.textContent = 'This sound could not play.';
  });
}

// Stops every sound on the page and rewinds it.
// Used when restarting, changing players, turning sounds off, or leaving the page,
// so no sound keeps playing when it shouldn't.
function stopSounds() {
  const sounds = document.querySelectorAll('audio');
  for (let i = 0; i < sounds.length; i++) {
    sounds[i].pause();
    sounds[i].currentTime = 0;
  }
}

// Starts a new game with the same players.
function resetGame() {
  stopSounds();
  // Empty the board and give X the first turn again.
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  playing = true;
  // Clear every square on screen, make it clickable, and reset its screen reader label to "empty".
  for (let i = 0; i < squares.length; i++) {
    squares[i].textContent = '';
    squares[i].disabled = false;
    // i + 1 because people count squares from 1, but arrays start at 0.
    squares[i].setAttribute('aria-label', 'Square ' + (i + 1) + ', empty');
  }
  statusText.textContent = playerName() + "'s turn (X)";
  // Move keyboard focus to the first square so keyboard users can start playing straight away.
  squares[0].focus();
}

// Checks if the current player has three in a row. Returns true or false.
function hasWon() {
  // Look at each winning line in turn...
  for (let i = 0; i < winningLines.length; i++) {
    const line = winningLines[i];
    // ...and check if all three of its squares belong to the current player.
    // I only need to check the current player, because only they have just moved.
    if (board[line[0]] === currentPlayer &&
        board[line[1]] === currentPlayer &&
        board[line[2]] === currentPlayer) {
      return true;
    }
  }
  // No line matched, so nobody has won yet.
  return false;
}

// Ends the game: shows the result message, locks the board and plays the right sound.
function finishGame(message: string, sound:string) {
  playing = false;
  statusText.textContent = message;
  // Disable all squares so nobody can keep playing after the game is over.
  for (let i = 0; i < squares.length; i++) squares[i].disabled = true;
  playSound(sound);
  // Move focus to "Play again" because that is the most likely next action.
  restartButton.focus();
}

// Runs when a square is clicked. "index" is the square's position (0 to 8).
function makeMove(index: number) {
  // Ignore the click if the game isn't running or the square is already taken.
  if (!playing || board[index] !== '') return;
  // Save the move in the array AND show it on screen.
  board[index] = currentPlayer;
  squares[index].textContent = currentPlayer;
  // A square can't be used twice, so disable it.
  squares[index].disabled = true;
  // Update the label so screen readers say e.g. "Square 5, X".
  squares[index].setAttribute('aria-label', 'Square ' + (index + 1) + ', ' + currentPlayer);
  // Check for a win first. "return" stops the function so the turn doesn't switch afterwards.
  if (hasWon()) {
    finishGame(playerName() + ' wins!', 'win-sound');
    return;
  }
  // If there are no empty squares left and nobody won, it's a draw.
  if (!board.includes('')) {
    finishGame("It's a draw!", 'draw-sound');
    return;
  }
  // The game continues: play the sound for this player's move (x-sound or o-sound).
  playSound(currentPlayer.toLowerCase() + '-sound');
  // Swap turns.
  if (currentPlayer === 'X') currentPlayer = 'O';
  else currentPlayer = 'X';
  statusText.textContent = playerName() + "'s turn (" + currentPlayer + ')';
  // The square just clicked is now disabled, so it loses keyboard focus.
  // This moves focus to the first free square so keyboard users don't get lost.
  for (let i = 0; i < squares.length; i++) {
    if (!squares[i].disabled) {
      squares[i].focus();
      break; // Stop after finding the first free square.
    }
  }
}


// ---- 4. Event listeners (connect the page to the functions) ----

// Give each square a click listener that calls makeMove with that square's number.
// Using "let i" means each square remembers its own value of i.
for (let i = 0; i < squares.length; i++) {
  squares[i].addEventListener('click', function () { makeMove(i); });
}
// When the names form is submitted (button click or Enter key)...
playerForm.addEventListener('submit', function (event) {
  // Stop the form reloading the page, which is what forms normally do.
  event.preventDefault(); 
  // .trim() removes spaces at the start and end, so a name of only spaces counts as empty.
  playerX = (document.getElementById('player-x') as HTMLInputElement).value.trim();
  playerO = (document.getElementById('player-o') as HTMLInputElement).value.trim();
  // Extra check in case a name was only spaces ("required" in the HTML doesn't catch that).
  if (!playerX || !playerO) {
    document.getElementById('player-message')!.textContent = 'Enter both names.';
    return;
  }
  // Names are fine: clear any old error, hide the form, turn on the game buttons and start.
  document.getElementById('player-message')!.textContent = '';
  playerForm.hidden = true;
  restartButton.disabled = false;
  changeButton.disabled = false;
  resetGame();
});
// "Play again" simply starts a new game with the same names.
restartButton.addEventListener('click', resetGame);
// "Change players" puts everything back to how it was when the page first loaded.
changeButton.addEventListener('click', function () {
  stopSounds();
  playing = false;
  // Show the names form again and disable the game buttons.
  playerForm.hidden = false;
  restartButton.disabled = true;
  changeButton.disabled = true;
  // Clear and lock the board until new names are entered.
  for (let i = 0; i < squares.length; i++) {
    squares[i].textContent = '';
    squares[i].disabled = true;
    squares[i].setAttribute('aria-label', 'Square ' + (i + 1) + ', empty');
  }
  statusText.textContent = 'Enter your names to start.';
  // Put the cursor in the first name box, ready to type.
  document.getElementById('player-x')!.focus();
});
// If the sound box is ticked or unticked, stop any sound that is playing right now.
soundCheckbox.addEventListener('change', stopSounds);
// When the user leaves the page, stop all sounds.
window.addEventListener('pagehide', stopSounds);
