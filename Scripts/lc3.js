/*
System set up
*/

var haltButton = document.getElementById("halt");
haltButton.setAttribute("disabled", "disabled");

var input = document.getElementById("input");

var search = document.getElementById("search");

var memory = new Array(65536);
for (var i = 0; i < memory.length; i++) {
	memory[i] = 0;
}
initializeMemory();
var registers = new Array(8);
for (var i = 0; i < registers.length; i++) {
	registers[i] = 0;
} 
var pc = 12288;
var ir = 0;
var psr = 8002;
var flags = [0,1,0];
var savedFlags = [0,0,0];
var halt = false;
var wait = false;
var code = [];
var viewStart = pc;
var wasRunning = false;
var labels = [];

updateMemory();
updateRegisters();
/*
System running functions
*/
//Parser function to handle binary instructions
function parser(instruction) {
	//Determine opcode
	var opcode = instruction.slice(0,4);
	//Add
	if (opcode == "0001") {
		var result = 0;
		if (instruction[10] == "1") {
			var dest = binToDec(instruction.slice(4, 7), false);
			var src1 = binToDec(instruction.slice(7,10), false);
			var imm5 = binToDec(instruction.slice(11));

			result = registers[src1] + imm5;
			registers[dest] = result;
		} else {
			var dest = binToDec(instruction.slice(4, 7), false);
			var src1 = binToDec(instruction.slice(7,10), false);
			var src2 = binToDec(instruction.slice(13), false);

			result = registers[src1] + registers[src2];
			registers[dest] = result;
		}
		updateFlags(result);
	//And
	} else if (opcode == "0101") {
		var result = 0;
		if (instruction[10] == "1") {
			var dest = binToDec(instruction.slice(4, 7), false);
			var src1 = binSignExtend(decToBinary(registers[binToDec(instruction.slice(7,10), false)]));
			var imm5 = binSignExtend(instruction.slice(11));

			result = binToDec(and(src1, imm5));
			registers[dest] = result;
		} else {
			var dest = binToDec(instruction.slice(4, 7), false);
			var src1 = binSignExtend(decToBinary(registers[binToDec(instruction.slice(7,10), false)]));
			var src2 = binSignExtend(decToBinary(registers[binToDec(instruction.slice(13), false)]));

			result = binToDec(and(src1, src2));
			registers[dest] = result;
		}
		updateFlags(result);
	//Branch
	} else if (opcode == "0000") {
		var conditions = [instruction[4], instruction[5], instruction[6]];

		if (0 == conditions[0] && 0 == conditions[1] && 0 == conditions[2]) {
			pc += binToDec(instruction.slice(7));
		} else if (1 == conditions[0] && 1 == conditions[1] && 1 == conditions[2]) {
			pc += binToDec(instruction.slice(7));
		} else if (flags[0] == conditions[0] && conditions[0] == "1") {
			pc += binToDec(instruction.slice(7));
		} else if (flags[1] == conditions[1] && conditions[1] == "1") {
			pc += binToDec(instruction.slice(7));
		} else if (flags[2] == conditions[2] && conditions[2] == "1") {
			pc += binToDec(instruction.slice(7));
		}
	//Jump
	} else if (opcode == "1100") {
		pc = registers[binToDec(instruction.slice(7,10), false)];
	//JSR and JSRR
	} else if (opcode == "0100") {
		if (instruction[4] == "1") {
			registers[7] = pc;
			pc += binToDec(instruction.slice(5));
		} else {
			registers[7] = pc;
			pc += binToDec(registers[binToDec(instruction.slice(7, 10), false)]);
		}
	//Load offset9
	} else if (opcode == "0010") {
		var result = memory[pc + binToDec(instruction.slice(7))];
		updateFlags(result);
		registers[binToDec(instruction.slice(4,7), false)] = result;
	//load indirect
	} else if (opcode == "1010") {
		var data = memory[memory[pc+binToDec(instruction.slice(7))]];
		updateFlags(result);
		registers[binToDec(instruction.slice(4,7), false)] = data;
	//load base register
	} else if (opcode == "0110") {
		var address = registers[binToDec(instruction.slice(7, 10), false)] + binToDec(instruction.slice(10));
		var data = memory[address];
		updateFlags(data);
		registers[binToDec(instruction.slice(4,7), false)] = data;
	//Load effective address
	} else if (opcode == "1110") {
		var data = pc + binToDec(instruction.slice(7));
		updateFlags(data);
		registers[binToDec(instruction.slice(4,7), false)] = data;
	//not
	} else if (opcode == "1001") {
		var data = binSignExtend(decToBinary(registers[binToDec(instruction.slice(7,10), false)]));
		var not = "";
		for (var i = 0; i < data.length; i++) {
			if (data[i] == "1") {
				not += "0";
			} else {
				not += "1";
			}
		}
		updateFlags(binToDec(not));
		registers[binToDec(instruction.slice(4,7), false)] = binToDec(not);
	//Return inerrupt
	} else if (opcode == "1000") {
		flags[0] = savedFlags[0];
		flags[1] = savedFlags[1];
		flags[2] = savedFlags[2];

		pc = registers[binToDec(instruction.slice(7,10), false)];
	//Store offset9
	} else if (opcode == "0011") {
		memory[pc + binToDec(instruction.slice(7))] = registers[binToDec(instruction.slice(4,7), false)];
	//Store indirect
	} else if (opcode == "1011") {
		var address = memory[pc + binToDec(instruction.slice(7))];
		memory[address] = registers[binToDec(instruction.slice(4,7), false)];
	//Store base + offset6
	} else if (opcode == "0111") {
		memory[registers[binToDec(instruction.slice(7,10), false)]+binToDec(instruction.slice(10))] = registers[binToDec(instruction.slice(4,7), false)];
	//trap
	} else if (opcode == "1111") {
		var trap = binToDec(instruction.slice(8), false);
		registers[7] = pc+1;

		if (trap == 32) {
			getInput()
		} else if (trap == 33) {
			out(0) 
		} else if (trap == 34) {
			out(1) 
		} else if (trap == 35) {
			getInput()
		} else if (trap == 37) {
			toggleHalt();
		}
	}
}

//Input function wait if no input available
function getInput() {
	//If input box is empty, wait for input
	if (input.value == "") {
		wait = true;
		//add event listener to input form
		input.addEventListener("keyup", waitInput);
	//if there is stuff in box then parse code for char
	} else {
		var char = input.value.charCodeAt(0);
		input.value = input.value.slice(1);
		//r0 gets character code
		registers[0] = char;
	}
}
//Event listener function called onChange of input box 
function waitInput(event) {
	//get character
	var char = input.value.charCodeAt(0);
	//remove char from box
	input.value = input.value.slice(1);
	
	//remove wait tag, add char to r0, and update
	registers[0] = char; 
	wait = false;
	updateRegisters();
	
	//Remove eventlistener from input box
	input.removeEventListener("keyup", waitInput);
	//If program was running, restart
	if (wasRunning) {
		start();
	}
}
//Function to output to console
function out(op) {
	//get console object and its content
	var console = document.getElementById("console");
	var string = console.textContent;

	//if outputting single char OUT
	if (op == 0) {
		string += String.fromCharCode(registers[0]);

		console.textContent = string;
	//outputting string based on mem address PUTS
	} else {
		//get mem address in register
		var i = registers[0];
		//While string not 0 terminated
		while (memory[i] != 0) {
			string += String.fromCharCode(memory[i]);
			i++;
		}
		console.textContent = string;
	}
	console.scrollTo(0, console.scrollHeight);
}
//AND function used in parser
function and(one, two) {
	var bin = "";
	//Compare each bit for both being 1
	for (var i = 0; i < one.length; i++) {
		if (one[i] == 1 && two[i] == 1) {
			bin += "1";
		} else {
			bin += "0";
		}
	}
	return bin;
}

//Function that updates flags after register change
function updateFlags(number) {
	//Check number for n, z, p and adjust flag
	flags = [0,0,0];
	if (number == 0) {
		flags[1] = 1;
	} else if (number < 0) {
		flags[0] = 1;
	} else {
		flags[2] = 1;
	}
}

//Step through instruction
function step() {
	//Make sure that pc isn't overflowed and waiting isn't true
	if (!halt && pc < memory.length-1 && !wait) {
		//load instruction register
		ir = memory[pc];
		//increment pc
		pc++;
		//parse instruction
		parser(binSignExtend(decToBinary(ir)));
		//update webpage
		updateRegisters();
		updateMemory();
	}
}

//Funtion to run until halt trap
function start() {
	//set running flag to true
	wasRunning = true;
	//step while pc not overflowed and halt not true
	while (halt == false && pc < memory.length-1 && !wait) {
		step();
	}
	//If exited for reason other than wait, toggle halt
	if (!wait) {
		toggleHalt();
	}
	//Update webpage
	updateMemory();
	updateRegisters();
}

//Function that resets the system
function reset() {
	//unhalt system
	halt = false;
	//set pc to x3000
	pc = 12288;
	//reset instruction register
	ir = 0;
	//clear geeneral purpose registers
	registers = [0, 0, 0, 0, 0, 0, 0, 0];
	//reset condition flags
	flags = [0, 1, 0];
	//reset webpage
	var console = document.getElementById("console");
	console.textContent = "";
	updateRegisters();
	updateMemory();
}

/*
Webpage interaction functions
*/
//Toggles showing the raw binary/hex code
function toggle() {
	var raw = document.getElementById("raw");

	if (raw.style.display == "none") {
		raw.style.display = "block"
	} else {
		raw.style.display = "none";
	}
}
//Toggles showing the assembly code
function toggleAsm() {
	var asm = document.getElementById("assembly");

	if (asm.style.display == "none") {
		asm.style.display = "block";
	} else {
		asm.style.display = "none"
	}
}
//Submits raw code for parsing
function submit() {
	//clear code array
	code = [];
	//get form object
	var raw = document.getElementById("rawcode").value;
	
	if (document.getElementById("bin").checked) {
		//regex to filter anything thats not binary
		var binary = raw.replace(/[^0-1]/g, "");

		//cut binary into 16 bit instructions
		for (var i = 0; i < binary.length; i += 16) {
			code.push(binary.slice(i, i+16));
		}
		//pc gets the first address specified 
		pc = binToDec(code[0]);
		
		//put instructions in memory
		for (var i = 1; i < code.length; i++) {
			memory[pc+(i-1)] = (binToDec(code[i]));
		}
	} else {
		//Regex to filter anything thats not hex
		var hex = raw.replace(/[^0-9a-fA-F]/g, "");

		for (var i = 0; i < hex.length; i += 4) {
			code.push(hexToDec(hex.slice(i, i+4)));
		}

		pc = code[0]

		for (var i = 0; i < code.length; i++) {
			memory[pc+(i-1)] = code[i];
		}
	}
	//initialize viewatart to be at code
	viewStart = pc;
	//update webpage
	updateRegisters();
	updateMemory();
	toggle();
}
var asmDirectives = ["ADD", "AND", "NOT", "LD", "LDI", "LDR", "LEA", "ST", "STI", "STR", "BR", "JMP", "JSR", "JSRR", "RET", "RTI", "TRAP", "GETC", "IN", "OUT", "PUTS", "PUTSP", "HALT"];

function initializeMemory() {
	for (var i = 0; i < memory.length; i++) {
		memory[i] = 0;
	}
	for (var i = 1; i < 256; i++) {
		memory[i] = -768;
	}
	var trapTable = [[".FILL", "x0400"], [".FILL", "x0430"], [".FILL", "x0450"], [".FILL", "x04A0"], [".FILL", "x04E0"], [".FILL", "xFD70"]];
	var programs = [
						[["TRAP_GETC", "ST", "R7", "x0408"], ["LDI", "R0", "x0406"], ["BRzp", "x0401"], ["LDI", "R0", "x0407"], ["LD", "R7", "x408"], ["RET"], [".FILL", "xFE00"], [".FILL", "xFE02"], ["ST", "R0", "x040A"]],
						[["TRAP_OUT", "ST", "R7", "x043B"], ["ST", "R1", "x043A"], ["LDI", "R1", "x0438"], ["BRzp", "x0432"], ["STI", "R0", "x0439"], ["LD", "R1", "x043A"], ["LD", "R7", "x043B"], ["RET"], [".FILL", "xFE04"], [".FILL", "xFE06"], ["STR", "R0", "R0", "#8"], ["ST", "R0", "x049F"]],
						[["TRAP_PUTS", "ST", "R7", "x0467"], ["ST", "R0", "x0464"], ["ST", "R1", "x0465"], ["ST", "R2", "x0466"], ["LDR", "R1", "R0", "#0"], ["BRz", "x045B"], ["LDI", "R2", "x0460"], ["BRzp", "x0456"], ["STI", "R1", "x0461"], ["ADD", "R0", "R0", "#1"], ["BRnzp", "x0454"], ["LD", "R0", "x0464"], ["LD", "R1", "x0465"], ["LD", "R2", "x0466"], ["LD", "R7", "x0467"], ["RET"], [".FILL", "xFE04"], [".FILL", "xFE06"], [".FILL", "xF3FD"], [".FILL", "xF3FE"]],
						[["TRAP_IN", "ST", "R7", "x04A7"], ["LEA", "R0", "x04A8"], ["PUTS"], ["GETC"], ["OUT"], ["LD", "R7", "x04A7"], ["RET"]],
						[["TRAP_PUTSP", "ST", "R7", "x0508"], ["ST", "R0", "x0504"], ["ST", "R1", "x0505"], ["ST", "R2", "x0506"], ["ST", "R3", "x0507"], ["ADD", "R1", "R0", "#0"], ["LDR", "R0", "R1", "#0"], ["BRz", "x04EE"], ["JSR", "x04F6"], ["LD", "R2", "x0502"], ["AND", "R0", "R0", "R2"], ["BRz", "x04EE"], ["ADD", "R1", "R1", "#1"], ["BRnzp", "x04E6"], ["LD", "R0", "x0503"], ["JSR", "x04F6"], ["LD", "R0", "x0504"], ["LD", "R1", "x0505"], ["LD", "R2", "x0506"], ["LD", "R3", "x0507"], ["LD", "R7", "x0508"], ["RET"], ["ST", "R7", "x04FD"], ["LDI", "R3", "x04FF"], ["BRn", "x04FA"], ["BRnzp", "x04F6"], ["STI", "R0", "x04FE"], ["LD", "R7", "x04FD"], ["RET"], [".FILL", "x0000"], [".FILL", "xFE06"], [".FILL", "xFE04"], [".FILL", "xF3FD"], [".FILL", "xF3FE"], [".FILL", "xFF00"]],
						[["TRAP_HALT", "ST", "R7", "xFD7F"], ["ST", "R1", "xFD7E"], ["ST", "R0", "FD7D"], ["LEA", "R0", "xFD80"], ["PUTS"], ["LDI", "R1", "xFDA%"], ["LD", "R0", "xFDA6"], ["AND", "R0", "R1", "R0"], ["STI", "R0", "xFDA5"], ["LD", "R0", "xFD7D"], ["LD", "R1", "xFD7E"], ["LD", "R7", "xFD7F"], ["RET"], [".FILL", "x0039"], [".FILL", "x7008"], [".FILL", "x3067"], [".STRINGZ", "\"\n----- Halting the processor -----\""]]
					];
	var restore = pc;
	for (var i = 0; i < trapTable.length; i++) {
		memory[32+i] = asmToBin(trapTable[i], 0, true);
		pc = hexToDec(trapTable[i][1].slice(1), false) - 1;
		console.log(decToHex(pc));
		for (var e = 0; e < programs[i].length; e++) {
			pc++;
			try {
				if (elIn(programs[i][e][0], asmDirectives)) {
					memory[pc] = asmToBin(programs[i][e], 0, false);
				} else if (elIn(programs[i][e][1], asmDirectives)) {
					memory[pc] = asmToBin(programs[i][e], 1, false);
				} else if (elIn(programs[i][e][0].slice(0,2), asmDirectives)) {
					memory[pc] = asmToBin(programs[i][e], 0, false);
				} else if (programs[i][e][0][0] == "." || programs[i][e][1][0] == ".") {
					if (programs[i][e][1][0] == ".") {
						var test = asmToBin(programs[i][e], 1, true);
						memory[pc] = test;
					} else {
						memory[pc] = asmToBin(programs[i][e], 0, true);
					}

				}
			} catch(e) {}
			
		}
	}
	pc = restore;
	
}
function elIn(word, list) {
	for (var i = 0; i < list.length; i++) {
		if (word == list[i]) {
			return true;
		}
	}
	return false;
}
function escapeConverter(string) {
	var sequences = [["\\\'", "\'"], ["\\\"", "\""], ["\\\\", "\\"], ["\\b", "\b"], ["\\f", "\f"], ["\\n", "\n"], ["\\r", "\r"], ["\\t", "\t"], ["\\v", "\v"]];
	var re = /\\([\\a-z])/g;
	var match;
	var lastIndex = 0;
	var tempString = "";
	while ((match = re.exec(string)) != null) {
		var replacement;
		for (var i = 0; i < sequences.length; i++) {
			if (match[0] == sequences[i][0]) {
				replacement = sequences[i][1];
			}
		}
		if (replacement == undefined) {
			replacement = "";
		}
		tempString += string.substr(lastIndex, match.index-2) + replacement;
		lastIndex = match.index + match[0].length;
	}
	tempString += string.substr(lastIndex);
	return tempString;
}
//function called on assembly submission
function submitAsm() {
	labels = [];
	//clear code array
	code = [];
	//get form object
	var asm = document.getElementById("assemblyCode").value.split("\n");
	
	//regex to filter anything thats not binary

	//cut binary into 16 bit instructions
	for (var i = 0; i < asm.length; i++) {
		asm[i] = asm[i].replace(", ", " ");
		asm[i] += " ";
		if (asm[i].indexOf(";") < asm[i].indexOf("\"")) {
			asm[i] = asm[i].slice(0, asm[i].indexOf("\"", asm[i].indexOf("\"")+1));
		} else if (asm[i].indexOf(";" != -1)) {
			asm[i] = asm[i].slice(0, asm[i].indexOf(";"));
		}
		asm[i] = asm[i].trim();
		var temp1 = asm[i].split(/\s/g);
		var temp2 = [];
		for (var e = 0; e < temp1.length; e++) {
			if (temp1[e] != "") {
				temp2.push(temp1[e]);
			}
		}
		if (temp2 != []) {
			code.push(temp2);
		}
		
	}

	if (code[0][0] == ".ORIG" && code[code.length-1][0] == ".END") {
		pc = hexToDec(code[0][1].slice(1), false) ;
		determineSymTable();

		for (var i = 1; i < code.length-1; i++) {
			try {
				if (elIn(code[i][0], asmDirectives)) {
					memory[pc] = asmToBin(code[i], 0, false);
				} else if (elIn(code[i][1], asmDirectives)) {
					memory[pc] = asmToBin(code[i], 1, false);
				} else if (elIn(code[i][0].slice(0,2), asmDirectives)) {
					memory[pc] = asmToBin(code[i], 0, false);
				} else if (code[i][0][0] == "." || code[i][1][0] == ".") {
					if (code[i][1][0] == ".") {
						var test = asmToBin(code[i], 1, true);
						memory[pc] = test;
					} else {
						memory[pc] = asmToBin(code[i], 0, true);
					}

				}
			} catch(e) {}
			pc++;
		}
		pc = hexToDec(code[0][1].slice(1), false);
	}

	//pc gets the first address specified e webpage
	updateRegisters();
	updateMemory();
	toggleAsm();
}

function asmToBin(assembly, i, asmDir) {
	if (!asmDir) {
		var instruction = assembly[i];
		if (instruction == "ADD") {
			if (assembly[i+3][0] == "R") {
				return binToDec("0001" + regCount(assembly[i+1][1]) + regCount(assembly[i+2][1]) + "000" + regCount(assembly[i+3][1]));
			} else {
				if (assembly[i+3][0] == "#") {
					return binToDec("0001" + regCount(assembly[i+1][1]) + regCount(assembly[i+2][1]) + "1" + binSignExtend(decToBinary(assembly[i+3].slice(1)), 5));
				} else {
					return binToDec("0001" + regCount(assembly[i+1][1]) + regCount(assembly[i+2][1]) + "1" + binSignExtend(hexToBinary(assembly[i+3].slice(1)), 5));
				}
			}
		} else if (instruction == "AND") {
			var bin = "0101" + regCount(assembly[i+1][1]) + regCount(assembly[i+2][1]);
			if (assembly[i+3][0] == "R") {
				return binToDec(bin + "000" + regCount(assembly[i+3][1]), 3);
			} else {
				if (assembly[i+3][0] == "#") {
					return binToDec(bin + "1" + binSignExtend(decToBinary((assembly[i+3].slice(1))), 5));
				} else {
					return binToDec(bin + "1" + binSignExtend(hexToBinary(assembly[i+3].slice(1)), 5));
				}
			}
		} else if (instruction.slice(0,2) == "BR") {
			var bin = "0000";
			var tempFlags = assembly[i].slice(2);
			var flagString = [0, 0, 0];
			for (var e = 0; e < tempFlags.length; e++) {
				if (tempFlags[e].toUpperCase() == "N") {flagString[0] = 1;}
				if (tempFlags[e].toUpperCase() == "Z") {flagString[1] = 1;}
				if (tempFlags[e].toUpperCase() == "P") {flagString[2] = 1;}
			}
			for (var e = 0; e < flagString.length; e++) {
				bin = bin + flagString[e];
			}
			var labeled = false;
			for (var e = 0; e < labels.length; e++) {
				if (labels[e][0] == assembly[i+1]) {
					bin += binSignExtend(decToBinary(labels[e][1] - (pc+1)), 9);
					labeled = true;
				}
			}
			if (!labeled) {
				bin += binSignExtend(decToBinary(hexToDec(assembly[i+1].slice(1), false)), 9);
			}
			return binToDec(bin);
		} else if (instruction == "JMP") {
			return binToDec("1100000" +regCount(assembly[i+1][1]) + "000000");
		} else if (instruction == "JSR") {
			var bin = "0101"
			if (assembly[i+1][0] == "#") {
				bin += binSignExtend(decToBinary((assembly[i+1].slice(1))), 11);
			} else {
				bin += binSignExtend(decToBinary(hexToDec(assembly[i+1].slice(1))),11);
			}
			return binToDec(bin);
		} else if (instruction == "JSRR") {
			return "0100000" + decToBinary(assembly[i+1][1], false) + "000000";
		} else if (instruction == "LD") {
			var bin = "0010";
			bin = bin + regCount(assembly[i+1][1]);

			var labeled = false;
			for (var e = 0; e < labels.length; e++) {
				if (labels[e][0] == assembly[i+2]) {
					bin = bin + binSignExtend(decToBinary(labels[e][1] - (pc+1)), 9);
					labeled = true;
				}
			}
			if (!labeled) {
				bin = bin + binSignExtend(decToBinary(hexToDec(assembly[i+1].slice(1))), 9);
			}
			return binToDec(bin);
		} else if (instruction == "LDI") {
			var bin = "1010";
			bin += regCount(assembly[i+1][1]);

			var labeled = false;
			for (var e = 0; e < labels.length; e++) {
				if (labels[e][0] == assembly[i+2]) {
					bin += binSignExtend(decToBinary(labels[e][1] - (pc+1)), 9);
					labeled = true;
				}
			}
			if (!labeled) {
				bin += binSignExtend(decToBinary(hexToDec(assembly[i+1].slice(1))), 9);
			}
			return binToDec(bin);
		} else if (instruction == "LDR") {
			var bin = "0110";
			bin += regCount(assembly[i+1][1]);
			bin += regCount(assembly[i+2][1]);
			
			if (assembly[3][0] == "#") {
				bin += binSignExtend(decToBinary((assembly[i+3].slice(1))), 6);
			} else {
				bin += binSignExtend(decToBinary(hexToDec(assembly[i+3].slice(1))),6);
			}

			return binToDec(bin);
		} else if (instruction == "LEA") {
			var bin = "1110";
			bin += regCount(assembly[i+1][1]);

			var labeled = false;
			for (var e = 0; e < labels.length; e++) {
				if (labels[e][0] == assembly[i+2]) {
					bin += binSignExtend(decToBinary(labels[e][1] - (pc+1)), 9);
					labeled = true;
				}
			}
			if (!labeled) {
				bin += binSignExtend(decToBinary(hexToDec(assembly[i+2].slice(1), false) - (pc+1)), 9);
			}
			return binToDec(bin);
		} else if (instruction == "NOT") {
			return binToDec("1001" + regCount(assembly[i+1][1]) + regCount(assembly[i+2][1]) + "111111");
		} else if (instruction == "RET") {
			return binToDec("1100000111000000");
		} else if (instruction == "RTI") {
			return binToDec("1000000000000000");
		} else if (instruction == "ST") {
			var bin = "0011";
			bin += regCount(assembly[i+1][1]);

			var labeled = false;
			for (var e = 0; e < labels.length; e++) {
				if (labels[e][0] == assembly[i+2]) {
					bin += binSignExtend(decToBinary(labels[e][1] - (pc+1)), 9);
					labeled = true;
				}
			}
			if (!labeled) {
				bin += binSignExtend(decToBinary(hexToDec(assembly[i+2].slice(1), false) - (pc+1)), 9);
			}
			return binToDec(bin);
		} else if (instruction == "STI") {
			var bin = "1011";
			bin += regCount(assembly[i+1][1]);

			var labeled = false;
			for (var e = 0; e < labels.length; e++) {
				if (labels[e][0] == assembly[i+1]) {
					bin += binSignExtend(decToBinary(labels[e][1] - (pc+i)), 9);
					labeled = true;
				}
			}
			if (!labeled) {
				bin += binSignExtend(decToBinary(hexToDec(assembly[i+1].slice(1), false) - (pc+i)), 9);
			}
			return binToDec(bin);
		} else if (instruction == "STR") {
			var bin = "0111";
			bin += regCount(assembly[i+1][1]);
			bin += regCount(assembly[i+2][1]);
			
			if (assembly[i+3][0] == "#") {
				bin += binSignExtend(decToBinary((assembly[i+3].slice(1))), 6);
			} else {
				bin += binSignExtend(decToBinary(hexToDec(assembly[i+3].slice(1))),6);
			}
			return binToDec(bin);
		} else if (instruction == "TRAP") {
			bin = "11110000";
			if (assembly[i+3][0] == "#") {
				bin += binSignExtend(decToBinary((assembly[i+3].slice(1) - pc+i)), 8);
			} else {
				bin += binSignExtend(decToBinary(hexToDec(assembly[i+3].slice(1)) - pc+i), 8);
			}
			return binToDec(bin);
		} else if (instruction == "GETC") {
			return binToDec("1111000000100000");
		} else if (instruction == "OUT") {
			return  binToDec("1111000000100001");
		} else if (instruction == "PUTS") {
			return  binToDec("1111000000100010");
		} else if (instruction == "IN") {
			return  binToDec("1111000000100011");
		} else if (instruction == "HALT") {
			return  binToDec("1111000000100101");
		}
	} else {
		if (assembly[i] == ".FILL") {
			if (assembly[i+1][0] == "x") {
				return hexToDec(assembly[i+1].slice(1));
			} else if (assembly[i+1][0] == "#") {
				return assembly[i+1].slice(1);
			}
		} else if (assembly[i] == ".BLKW") {
			if (assembly[i+1][0] == "x") {
				for (var e = 0; e < hexToDec(assembly[i+1].slice(1))-1; e++) {
					memory[pc] = 0;
					pc++; 
				}
				return 0;
			} else if (assembly[i+1][0] == "#") {
				for (var e = 0; e < hexToDec(assembly[i+1].slice(1))-1; e++) {
					memory[pc] = 0;
					pc++; 
				}
				return 0;
			}
		} else if (assembly[i] == ".STRINGZ") {
			var word = "";
			for (var e = 0; e < assembly.length; e++) {
				if (e >= 2) {
					word = word + assembly[e] + " ";
				}
			}
			word = escapeConverter(word.slice(1, word.length));
			console.log(word);
			for (var e = 0; e < word.length; e++) {
				memory[pc] = word.charCodeAt(e);
				console.log(pc + " " + decToHex(pc) + " " + word.charCodeAt(e) + " " + memory[pc]);
				pc++;
			}
			return 0;
		}
	}
}

function regCount(string) {
	if (string < 4) {
		return binSignExtend(decToBinary(string), 3);
	} else {
		return binSignExtend(decToBinary(string, false), 3);
	}
}

function determineSymTable() {
	var tempPC = pc-1;
	for (var i = 1; i < code.length; i++) {
		tempPC++;
		try {
			if (elIn(code[i][1], asmDirectives) || code[i][1][0] == ".") {
				if (code[i][1] == ".BLKW") {
					labels.push([code[i][0], tempPC]);

					if (code[i][2][0] == "x") {
						for (var e = 0; e < hexToDec(code[i][2].slice(1)); e++) {
							tempPC++; 
						}
					} else if (code[i][2][0] == "#") {
						for (var e = 0; e < hexToDec(code[i][2].slice(1)); e++) {
							tempPC++; 
						}
					}
				} else if (code[i][1] == ".STRINGZ") {
					labels.push([code[i][0], tempPC]);
					var word = "";
					for (var e = 0; e < code[i].length; e++) {
						if (e >= 2) {
							word = word + code[i][e] + " ";
						}
					}
					word = escapeConverter(word.slice(0, word.length));
					tempPC += word.length;
				} else {
					labels.push([code[i][0], tempPC]);
				}
			}
			
		} catch(e) {

		}
		
	}
}

//Update webpage memory table
function updateMemory() {
	//get memory table object
	var memTable = document.getElementById("memTable");
	//clear anything inside the table
	memTable.innerHTML = "";

	//Add the header reow
	var header = document.createElement("tr");
	var textContents = ["Address", "Label", "Hex", "Instruction"];

	for (var i = 0; i < 4; i++) {
		var data = document.createElement("td");
		data.textContent = textContents[i];
		header.appendChild(data);
	}
	memTable.appendChild(header);

	//Add 10 memory instructions
	for (var i=0; i < 10; i++) {
		//create row
		var row = document.createElement("tr");
		//fill row with data
		for (var e = 0; e < 4; e++) {
			var data = document.createElement("td");
			if (e == 0) {
				data.textContent = decToHex((viewStart + i)).toUpperCase();
			} else if (e == 1) {
				for (var x = 0; x < labels.length; x++) {
					if (labels[x][1] == viewStart+i) {
						data.textContent = labels[x][0];
					}
				}
			} else if (e == 2) {
				data.textContent = binToHex(binSignExtend(decToBinary(memory[viewStart+i]))).toUpperCase();
			} else {
				data.textContent = binToAssembly(binSignExtend(decToBinary(memory[viewStart+i])), viewStart+i);
			}
			row.appendChild(data);
		}
		memTable.appendChild(row);
	}
}

//Function to update registers
function updateRegisters() {
	//get register table object
	var regTable = document.getElementById("registers");
	regTable.innerHTML = "";

	//Fill table with register rows
	var e = 0;
	for (var i = 0; i < 2; i++) {
		var row = document.createElement("tr");
		for (e; e < 4+4*i; e++) {
			var data = document.createElement("td");
			data.textContent = "R" + e + ": " + binToHex(binSignExtend(decToBinary(registers[e])))
			row.appendChild(data);
		}
		regTable.appendChild(row);
	}
	//Fill the next row with system conditions
	var row = document.createElement("tr");
	var registerTexts = ["PC: ", "IR: ", "Flags: "];

	for (var i = 0; i < 3; i++) {
		var data = document.createElement("td");
		if (i == 0) {
			data.textContent = (registerTexts[i] + decToHex(pc)).toUpperCase();
		} else if (i == 1) {
			data.textContent = (registerTexts[i] + binToHex(binSignExtend(decToBinary(ir)))).toUpperCase();
		} else {
			var content = registerTexts[i];
			if (flags[0] == 1) {
				content += "n";
			}
			if (flags[1] == 1) {
				content += "z";
			}
			if (flags[2] == 1) {
				content += "p";
			}
			data.textContent = content;
		}
		row.appendChild(data);
	}
	regTable.appendChild(row);
}

//Function called on search box change to update mem table
function searchMem() {
	//check if decimal or hex
	if (search.value[0] == "x") {
		viewStart = parseInt(search.value.slice(1), 16);
	} else if (parseInt(search.value) >= 0 && parseInt(search.value) <= memory.length - 10) {
		viewStart = parseInt(search.value);
	}
	updateMemory();
}

//function to change halt system
function toggleHalt() {
	if (halt) {
		halt = false;
		haltButton.setAttribute("disabled", "disabled");
	} else {
		halt = true;
		haltButton.removeAttribute("disabled");
	}
}

/*
Hex and binary parser functions
*/
//Function that converts decimal to binary
function decToBinary(dec, signed) {
	//signed by default
	if (signed == undefined) {
		signed = true;
	} 
	//if signed
	if (signed) {
		//if dec greater than or equal to zero make sure leading bit is 0
		if (dec >= 0) {
			return ("0" + (dec >>> 0).toString(2));
		//if dec is less than zero clear leading 1s
		} else {
			var binString = (dec >>> 0).toString(2);
			var i = 0;
			//Loop while not zero and string still has chars
			while (binString[i] != "0" && i < binString.length) {
				i++;
			}
			//remove excess leading 1s
			binString = binString.slice(i-1);
			return binString;
		}
	//if unsigned
	} else {
		return (dec >>> 0).toString(2);
	}
}
//function to convert decimal to hex
function decToHex(number, signed) {
	var hex = "";
	//default signed as true
	if (signed == undefined) {
		signed = true;
	}
	//calculate hex as signed
	if (signed) {
		if (number >= 0) {
			number = number.toString(16);
			
			hex = number;
		} else {
			number = -1 * number;
			var temp = number.toString(16);

			for (var i = 0; i < temp.length; i++) {
				hex += (15 - parseInt(temp[i], 16)).toString(16);
			}
			while (hex.length < 4) {
				hex = "F" + hex;
			} 
		}
	//calculate hex as unsigned
	} else {
		hex = number.toString(16);
	}
	return hex.toUpperCase();
}
//Function to convert binary to decimal
function binToDec(bin, signed) {
	//default signed to true
	if (signed == undefined) {
		signed = true;
	}
	//Parse bin as signed
	if (signed) {
		//if bin is postive parse as usual
		if (bin[0] == "0") {
			return Number.parseInt(bin, 2);
		//convert based on 2s complement
		} else {
			var tempBin = "";
			//calculate the not of the number
			for (var i = 0; i < bin.length; i++) {
				if (bin[i] == "0") {
					tempBin += "1";
				}  else {
					tempBin += "0";
				}
			}
			//Add 1 and multiple by negatibe 1
			return (Number.parseInt(tempBin, 2) + 1) * -1;
		}
	//parse bin as unsigned
	} else {
		return Number.parseInt(bin,2);
	}
}
//function to convert binary to hex
function binToHex(bin) {
	var hex = "";
	for (var i = 0; i < bin.length; i += 4) {
		hex += parseInt(bin.slice(i, i+4), 2).toString(16);
	}
	return hex.toUpperCase();
}
//function to convert hex to binary
function hexToBin(hex) {
	var bin = "";
	for (var i = 0; i < hex.length; i++) {
		var temp = hexToDec(hex[i], false).toString(2);
		while (temp.length < 4) {
			temp = "0" + temp;
		}

		bin += temp;
	}
	return bin;
}
//function to convert hex to decimal
function hexToDec(hex, signed) {
	if (signed == undefined) {
		signed = true;
	}

	if (signed) {
		if (parseInt(hex[0], 16) < 8) {
			return parseInt(hex, 16);
		} else {
			var temp = "";
			for (var i = 0; i < hex.length; i++) {
				temp = temp + (15-parseInt(hex[i], 16)).toString(16);
			}
			return (parseInt(temp, 16)+1) * -1;
		}
	} else {
		return parseInt(hex, 16);
	}
}
//function to sign extend binary
function binSignExtend(bin, bits) {
	//default num bits to 16
	if (bits == undefined) {
		bits = 16;
	}
	var tempBin = "";
	//if leading bit is 1, extend 1s until bits length
	if (bin[0] == "1") {
		for (var i = 0; i < bits-bin.length; i++) {
			tempBin = tempBin + "1";
		}
		tempBin += bin;
	//if leading bit is 0, extend 0s until bits length
	} else {
		for (var i = 0; i < bits-bin.length; i++) {
			tempBin = tempBin + "0";
		}
		tempBin += bin;
	}
	return tempBin;
}
//Function to sign extend hex numbers
function hexSignExtend(hex, bits) {
	var temp = "";
	//default length to 4
	if (bits == undefined) {
		bits = 4;
	}
	//Extend for negative or positive respectively
	if (parseInt(hex[0], 16) >= 8) {
		for (var i = 0; i < bits-hex.length; i++) {
				temp = temp + "F";
		}
	} else {
		for (var i = 0; i < bits-hex.length; i++) {
				temp = temp + "0";
		}
	}
	temp += hex;
	return temp;
}


/*
Assembly Functions
*/
//Converts binary to assembly for memory update
function binToAssembly(bin, mem) {
	//Determine opcode
	var opcode = bin.slice(0,4);
	if (bin == "0000000000000000") {
		return "NOP";
	}
	//Add
	else if (opcode == "0001") {
		if (bin[10] == "1") {
			var dest = binToDec(bin.slice(4, 7), false);
			var src1 = binToDec(bin.slice(7,10), false);
			var imm5 = binToDec(bin.slice(11));

			return "ADD R" + dest + ", R" + src1 + ", #" + imm5; 
		} else {
			var dest = binToDec(bin.slice(4, 7), false);
			var src1 = binToDec(bin.slice(7,10), false);
			var src2 = binToDec(bin.slice(13), false);

			return "ADD R" + dest + ", R" + src1 + ", R" + src2;
		}
	//And
	} else if (opcode == "0101") {
		var result = 0;
		if (bin[10] == "1") {
			var dest = binToDec(bin.slice(4, 7), false);
			var src1 = binToDec(bin.slice(7,10), false);
			var imm5 = binToDec(bin.slice(11));

			return "AND R" + dest + ", R" + src1 + ", #" + imm5;
		} else {
			var dest = binToDec(bin.slice(4, 7), false);
			var src1 = binToDec(bin.slice(7,10), false);
			var src2 = binToDec(bin.slice(13), false);

			return "AND R" + dest + ", R" + src1 + ", R" + src2;
		}
	//Branch
	} else if (opcode == "0000") {
		var conditions = [bin[4], bin[5], bin[6]];
		var jump = "BR";
		if (conditions[0] == 1) {
			jump += "n";
		}
		if (conditions[1] == 1) {
			jump += "z";
		}
		if (conditions[2] == 1) {
			jump += "p";
		}
		jump = jump + " x" + decToHex(mem+1+binToDec(bin.slice(7)));
		return jump;
	//Jump
	} else if (opcode == "1100") {
		return "JMP R" + binToDec(bin.slice(7,10), false);
	//JSR and JSRR
	} else if (opcode == "0100") {
		if (bin[4] == "1") {
			return "JSR x" + decToHex(mem+binToDec(bin.slice(5), false));
		} else {
			return "JSRR R" + binToDec(bin.slice(7,10), false); 
		}
	//Load offset9
	} else if (opcode == "0010") {
		return "LD R" + binToDec(bin.slice(4,7), false) + " x" + decToHex(mem+1 + binToDec(bin.slice(7)));
	//load indirect
	} else if (opcode == "1010") {
		return "LDI R" + binToDec(bin.slice(4,7), false) + " x" + decToHex(mem+1 + binToDec(bin.slice(7)))
	//load base register
	} else if (opcode == "0110") {
		return "LDR R" + binToDec(bin.slice(4,7), false) + ", R" + binToDec(bin.slice(7, 10), false) + ", #" + binToDec(bin.slice(10));
	//Load effective address
	} else if (opcode == "1110") {
		return "LEA R" + binToDec(bin.slice(4,7), false) + ", x" + decToHex(mem+1 + binToDec(bin.slice(7)));
	//not
	} else if (opcode == "1001") {
		return "NOT R" + binToDec(bin.slice(4,7), false) + ", R" + binToDec(bin.slice(7,10), false);
	//Return inerrupt
	} else if (opcode == "1000") {
		return "RTI";
	//Store offset9
	} else if (opcode == "0011") {
		return "ST R" + binToDec(bin.slice(4,7), false) + ", x" + decToHex(mem+1 + binToDec(bin.slice(7)));
	//Store indirect
	} else if (opcode == "1011") {
		return "STI R" + binToDec(bin.slice(4,7), false) + ", x" + decToHex(mem+1 + binToDec(bin.slice(7)));
	//Store base + offset6
	} else if (opcode == "0111") {
		return "STR R" + binToDec(bin.slice(4,7), false) + ", R" + binToDec(bin.slice(7,10), false) + ", #" + binToDec(bin.slice(10));
	//trap
	} else if (opcode == "1111") {
		if (bin.slice(3, 8) == "0000") {
			var trap = binToDec(bin.slice(8));

			if (trap == 32) {
				return "GETC";
			} else if (trap == 33) {
				return "OUT";
			} else if (trap == 34) {
				return "PUTS";
			} else if (trap == 35) {
				return "IN";
			} else if (trap == 37) {
				return "HALT"
			}
			return "TRAP x" + binToHex(decToBinary(trap));
		} else {
			return ".FILL x" + binToHex(bin); 	
		}
	}
}