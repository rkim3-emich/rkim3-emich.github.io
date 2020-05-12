/*
Brainf*ck
Commands:
----------------------------------------------------------
|>| Increment Data Pointer
----------------------------------------------------------
|<| Decrement Data Pointer
----------------------------------------------------------
|+| Increment byte at data pointer
----------------------------------------------------------
|-| Decrement byte at data pointer
----------------------------------------------------------
|.| Output byte at data pointer
----------------------------------------------------------
|,| accept one byte of data and store at data pointer
----------------------------------------------------------
|[| jump forward if 0
----------------------------------------------------------
|]| jump backward if non zero
----------------------------------------------------------
*/
//DOM stuff
var console = document.getElementById("console");
var input = document.getElementById("input");
var code = document.getElementById("code");

//DOM stuff for status things
var pointer_disp = document.getElementById("pointer");
var mem_pointer_disp = document.getElementById("memory-pointer");
var i_disp = document.getElementById("i");
var brainfuck_i_disp = document.getElementById("brainfuck-i");

code.value = "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.";
//Initialize Brainf*ck code
brainfuck = "";
var wait = false;
var started = false;
var loop = [];
var i = 0;

var memory = new Array(30000);
for (var e = 0; e < memory.length; e++) {
	memory[e] = 0;
}
var pointer = 0;

function parser(char) {
	if (char == ">") {
		++pointer;
	} else if (char == "<") {
		--pointer;
	} else if (char == "+") {
		memory[pointer]++;
	} else if (char == "-") {
		memory[pointer]--;
	} else if (char == ".") {
		log(charConverter(memory[pointer]));
	} else if (char == ",") {
		if (input.value == "") {
			wait = true;
		} else {
			memory[pointer] = input.value.charCodeAt(0);
			input.value = "";
		}
		
	} else if (char == "[") {
		if (memory[pointer] == 0) {
			jump(1);
		}
	} else if (char == "]") {
		if (memory[pointer] != 0) {
			jump(0);
		}
	}
}
function charConverter(charNumber) {
	return String.fromCharCode(charNumber);
}
function log(char) {
	var string = console.textContent;
	string += char;
	console.textContent = string;
}
function consoleInput() {
	if (wait) {
		var text = input.value.charCodeAt(0);
		input.value = "";
		memory[pointer] = text;
		if (console.textContent == "") {
			console.textContent = ">" + String.fromCharCode(text);
		} else {
			var string = console.TextContent + "\n>" + String.fromCharCode(text) + "\n";
			console.textContent = string;
		}
		wait = false;
		update();
		start();
	}
}

function jump(direction) {
	if (direction == 1) {
		var e = 0;
		while (i != loop[e][0]) {
			e++;
		}
		i = loop[e][1]-1;
	} else {
		var e = 0;
		while (i != loop[e][1]) {
			e++;
		}
		i = loop[e][0];
	}
}
function start() {
	if (wait) {
		update();
	} else {
		if (started) {
			for(i; i < brainfuck.length; i++) {
				if (wait) {
					break;
				} else {
					parser(brainfuck[i]);
				}
			}
			update();
		} else {
			started = true;
			reset();
			brainfuck = code.value;
			loopEvaluate();
			for(i = 0; i < brainfuck.length; i++) {
				if (wait) {
					break;
				} else {
					parser(brainfuck[i]);
				}
			}
			update();
		}
	}
}
function step() {
	if (wait) {
		update();
	} else {
		started = true;
		brainfuck = code.value;
		loopEvaluate();
		if (i < brainfuck.length) {
			parser(brainfuck[i]);
			i++;
		}
		update();
	}
}
function loopEvaluate() {
	loop = [];
	var loopStarts = [];
	var loopEnds = [];
	for (var e = 0; e < brainfuck.length; e++) {
		if (brainfuck[e] == "[") {
			loopStarts.push(e);
		} else if (brainfuck[e] == "]") {
			loopEnds.push(e);
		}
	}
	
	for (var e = loopStarts.length-1; e >= 0; e--) {
		var f = 0;
		while(true) {
			if (loopStarts[e] < loopEnds[f]) {
				loop.push([loopStarts[e], loopEnds[f]]);
				loopEnds[f] = 0;
				break;
			}
			f++;
		}
	}
}
function update() {
	pointer_disp.textContent = pointer;
	mem_pointer_disp.textContent = memory[pointer];
	i_disp.textContent = i;
	brainfuck_i_disp.textContent = brainfuck[i];
}

function reset() {
	memory = new Array(30000);
	pointer = 0;
	i = 0;
	brainfuck = "";
	for (var e = 0; e < memory.length; e++) {
		memory[e] = 0;
	}
	console.textContent = "";
	wait = false;
	update();
}
function wait(callback) {
	if (input.value != "") {
		() => callback();
	} else {
		setTimeout(wait(callback), 1000);
	}
}
update();
//++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.