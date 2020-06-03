
//Size of game board
const SIZE = 17;

var player = [9, 9]
var food = [rand(17), rand(17)]
var shortest_path = [];
var score = 0;

var scoreDom = document.getElementById("score");
var points = document.getElementById("points");
var pathDom = document.getElementById("path");

//Function that returns binary random number
function rand(num) {
	return Math.floor(Math.random()*num);
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

//Function to display game board in HTML
function showHTML() {
	//Clear elements from inside game display
	body.innerHTML = '';

	scoreDom.textContent = "Score: " + score;
	points.textContent = "Start: [" + player + "]\nEnd: [" + food + "]";
	var text = "Path: ";
	for (var i = 0; i < shortest_path.length - 1; i++) {
		text = text + "[" + shortest_path[i] + "], ";
	}
	pathDom.textContent = text + "[" + shortest_path[shortest_path.length-1] + "]";

	//Fill game display rows with divs
	for (var y = 0; y < SIZE; y++) {
		var div = document.createElement("DIV");
		//Fill divs with spans
		for (var x = 0; x < SIZE; x++) {
			var span = document.createElement("SPAN");
			/*
			if (test != undefined) {
				span.innerHTML = test[y][x];
			}
			*/
			//Make span black if on and white if off
			if (compare([x,y], player)) {
				span.style.backgroundColor = "red";
			} else if (compare([x, y], food)) {
				span.style.backgroundColor = "#00FFff";
			} else if (findArrInArr([x, y], shortest_path)){
				span.style.backgroundColor = "#222222";
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

function findArrInArr(search, arr) {
	for (var i = 0; i < arr.length; i++) {
		if (compare(search, arr[i])) {
			return true;
		}
	}
	return false;
}
function evaluateGameState() {
	
	if (compare(player, food)) {
		food = [rand(SIZE), rand(SIZE)];
		score++;
	}
	shortest_path = path(player, food, SIZE);
	player[0] = shortest_path[0][0];
	player[1] = shortest_path[0][1];
}
var test;
function genGraph(start, size) {
	var graph = [];
	for (var y = 0; y < size; y++) {
		graph.push([]);
		for (var x =0; x < size; x++) {
			graph[y].push(0);
		}
	}
	for (var y = 0; y < size; y++) {
		graph[y][start[0]] = Math.abs(y-start[1]);
		for (var x = 0; x < size; x++) {
			graph[y][x] = Math.abs(x-start[0]) + graph[y][start[0]];
		}
	}
	test = graph;
	return graph;
}
function compare(arrone, arrtwo) {
	if (arrone.length != arrtwo.length) {
		return false
	}
	for (var i = 0; i < arrone.length; i++) {
		if (arrone[i] != arrtwo[i]) {
			return false;
		}
	}
	return true;
}
function copy(blank, orig) {
	for (var i = 0; i < orig.length; i++) {
		blank.push(orig[i]);
	}
	return blank;
}
function path(start, end, size) {
	shortest_path = [];
	var graph = genGraph(start, size);
	var last_dist = 0;
    var current_coord = copy([], start);
    var total_trav = [end[0]-start[0], end[1]-start[1]];

    while (!compare(current_coord, end)) {
        var travx = 0;
        var travy = 0;
        if (total_trav[0] != 0){
            travx = (total_trav[0]/Math.abs(total_trav[0]));
        }
        else if (total_trav[1] != 0){
            travy = (total_trav[1]/Math.abs(total_trav[1]));
        }
        var d = travx;
        if (last_dist+1 == graph[current_coord[1]][current_coord[0]+d] && total_trav[0] != 0){
            last_dist += 1;
            total_trav[0] += -1*travx;
            if (!compare(current_coord, start)) {
	            shortest_path.push(current_coord);
	        }
            current_coord = [current_coord[0]+d, current_coord[1]];
        }

        else if (last_dist+1 == graph[current_coord[1]+travy][current_coord[0]]) {
            d = travy;
            last_dist += 1;
            if (!compare(current_coord, start)) {
	            shortest_path.push(current_coord);
	        }
            current_coord = [current_coord[0], current_coord[1]+d];
        }
 	}
 	shortest_path.push(end);
	return shortest_path;    
}

//Function that runs the game
function run() {
	showHTML();
	evaluateGameState();
}
//Refresh on a timer
var interval = setInterval(run, 1000)

function reset() {
	clearInterval(interval);
	score = 0;
	interval = setInterval(run, 1000)
}