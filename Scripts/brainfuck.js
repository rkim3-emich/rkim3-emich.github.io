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

//Set value for code to be hello world
code.value = "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.";

//Initialize Brainf*ck code
brainfuck = "";
//variable to determine if code is halted
var wait = false;
//variable to determine if execution has started
var started = false;
//varaible to hold loop information
var loop = [];
//iterator for insturction being parsed
var i = 0;

//Array that acts as memory
var memory = new Array(30000);
//zero out memory
for (var e = 0; e < memory.length; e++) {
	memory[e] = 0;
}
//variable that holds pointer to memory
var pointer = 0;

//function that parses brainf*ck commands
function parser(char) {
	if (char == ">") {
		//increment pointer
		++pointer;
	} else if (char == "<") {
		//decrement pointer
		--pointer;
	} else if (char == "+") {
		//increment memory of pointer
		memory[pointer]++;
	} else if (char == "-") {
		//decrement memory of pointer
		memory[pointer]--;
	} else if (char == ".") {
		//put character on console
		log(charConverter(memory[pointer]));
	} else if (char == ",") {
		//get input and store it. Wait if no input
		if (input.value == "") {
			wait = true;
		} else {
			memory[pointer] = input.value.charCodeAt(0);
			input.value = "";
		}
		
	} else if (char == "[") {
		//jump forward if mem is 0
		if (memory[pointer] == 0) {
			jump(1);
		}
	} else if (char == "]") {
		//jump back if mem is not zero
		if (memory[pointer] != 0) {
			jump(0);
		}
	}
}
//function that converts numbers ito characters
function charConverter(charNumber) {
	return String.fromCharCode(charNumber);
}
//function that puts characters in console
function log(char) {
	var string = console.textContent;
	string += char;
	console.textContent = string;
}
//function called on input change that ends wait condition
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
//function to handle loop jumping
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
//function that auto executes to end of script
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
//function that steps through instructions
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
//function that determines where loops are
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
//Update status
function update() {
	pointer_disp.textContent = pointer;
	mem_pointer_disp.textContent = memory[pointer];
	i_disp.textContent = i;
	brainfuck_i_disp.textContent = brainfuck[i];
}
//Reset system parameters
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

update();
//++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.
