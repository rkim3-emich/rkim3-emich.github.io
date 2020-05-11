/*
Conway's Game of Life
Rules:
1. Any live cell with two or three live neighbors survives
2. Any dead cell with three live neighvbors becomes a live cell
3. All other live cells die in the next generation. Similarly, all other dead cells stay dead
*/

//Size of game board
const SIZE = 25;

//Function that returns binary random number
function rand() {
	return Math.floor(Math.random()*2);
}

//Function that creates empty two dimensional array
function arbitraryArray(height, width) {
	//Create y dimension of the array
	var array = new Array(height);

	//Fill the y dimension with arrays of width
	for (var i = 0; i < height; i++) {
		array[i] = new Array(width);
	}
	return array;
}

//Create the game board width
var board = arbitraryArray(SIZE, SIZE);
//DOM get html elem to put game in
var body = document.getElementById("gameboard");

//Populate game board with random binary values
for (var y = 0; y < SIZE; y++) {
	for (var x = 0; x < SIZE; x++) {
		board[y][x] = rand();
	}
} 

//Function to display game board in HTML
function showHTML() {
	//Clear elements from inside game display
	body.innerHTML = '';

	//Fill game display rows with divs
	for (var y = 0; y < SIZE; y++) {
		var div = document.createElement("DIV");
		//Fill divs with spans
		for (var x = 0; x < SIZE; x++) {
			var span = document.createElement("SPAN");
			//Make span black if on and white if off
			if (board[y][x] == 1) {
				span.style.backgroundColor = "black";
			} else {
				span.style.backgroundColor = "white";
			}
			//Append span to div
			div.appendChild(span);
		}
		//append div to game display
		body.appendChild(div);
	}
}

//Function to apply the rules of Conways Game of Life
function evaluateGameState() {
	//Create 2d array that holds number of neighbors per square
	var countBoard = arbitraryArray(SIZE, SIZE);
	for (var y = 0; y < SIZE; y++) {
		for (var x = 0; x < SIZE; x++) {
			countBoard[y][x] = neighbors(x, y);
		}
	} 
	//Evaluate each square of the game board
	for (var y = 0; y < SIZE; y++) {
		for (var x = 0; x < SIZE; x++) {
			//access count board for a square
			var count = countBoard[y][x];
			//apply the rules
			if (board[y][x] == 1 && (count == 2 || count == 3)) {

			} else if(board[y][x] == 0 && count == 3) {
				board[y][x] = 1;
			} else {
				board[y][x] = 0;
			}
		}
	}
}

//function to calculate the number of on neighbors of a square
function neighbors(x, y) {
	var count = 0;
	try {
		if (board[y][x-1] == 1) {
			count++;
		}
	} catch(err) {

	}
	try {
		if (board[y-1][x] == 1) {
			count++;
		}
	} catch(err) {

	}
	try {
		if (board[y][x+1] == 1) {
			count++;
		}
	} catch(err) {

	}
	try {
		if (board[y+1][x] == 1) {
			count++;
		}
	} catch(err) {

	}
	return count;
}

//Function that runs the game
function run() {
	showHTML();
	evaluateGameState();
}
//Refresh on a timer
setInterval(run, 200)
