var input = document.getElementById("input");
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

function generateBarCode() {
	var barcode = "11010010000";
	var check = 104;
	var charsToConv = input.value;

	for (var i = 0; i < charsToConv.length; i++) {
		var returned = encode(charsToConv[i]);
		if (returned[0] == "Err") {
			break;
		} else {
			barcode += returned[0];
			check += returned[1] * (i + 1);
		}
	}

	check = check % 103

	barcode += checkSum(check);

	barcode += "1100011101011";

	drawBarcode(barcode);
}
function drawBarcode(barcode) {
	for (var i = 0; i < barcode.length; i++) {
		context.beginPath();
		if (barcode[i] == "1") {
			context.lineWidth = "2";
			context.strokeStyle = "#000000";
			context.rect(i*2, 0, 0, 96);
		} else {
			context.lineWidth = "2";
			context.strokeStyle = "#FFFFFF";
			context.rect(i*2, 0, 0, 96);
		}
		context.stroke();
	}
}
function encode(char) {
	switch(char) {
		case " ":
			return ["11011001100", 0];
			break;
		case "!":
			return ["11001101100", 1];
			break;
		case "\"":
			return ["11001100110", 2];
			break;
		case "#":
			return ["10010011000", 3];
			break;
		case "$":
			return ["10010001100", 4];
			break;
		case "%":
			return ["10001001100", 5];
			break;
		case "&":
			return ["10011001000", 6];
			break;
		case "\'":
			return ["10011000100", 7];
			break;
		case "(":
			return ["10001100100", 8];
			break;
		case ")":
			return ["11001001000", 9];
			break;
		case "*":
			return ["11001000100", 10];
			break;
		case "+":
			return ["11000100100", 11];
			break;
		case ",":
			return ["10110011100", 12];
			break;
		case "-":
			return ["10011011100", 13];
			break;
		case ".":
			return ["10011001110", 14];
			break;
		case "/":
			return ["10111001100", 15];
			break;
		case "0":
			return ["10011101100", 16];
			break;
		case "1":
			return ["10011100110", 17];
			break;
		case "2":
			return ["11001110010", 18];
			break;
		case "3":
			return ["11001011100", 19];
			break;
		case "4":
			return ["11001001110", 20];
			break;
		case "5":
			return ["11011100100", 21];
			break;
		case "6":
			return ["11001110100", 22];
			break;
		case "7":
			return ["11101101110", 23];
			break;
		case "8":
			return ["11101001100", 24];
			break;
		case "9":
			return ["11100101100", 25];
			break;
		case ":":
			return ["11100100110", 26];
			break;
		case ";":
			return ["11101100100", 27];
			break;
		case "<":
			return ["11100110100", 28];
			break;
		case "=":
			return ["11100110010", 29];
			break;
		case ">":
			return ["11011011000", 30];
			break;
		case "?":
			return ["11011000110", 31];
			break;
		case "@":
			return ["11000110110", 32];
			break;
		case "A'":
			return ["10100011000", 33];
			break;
		case "B":
			return ["10001011000", 34];
			break;
		case "C":
			return ["10001000110", 35];
			break;
		case "D":
			return ["10110001000", 36];
			break;
		case "E":
			return ["10001101000", 37];
			break;
		case "F":
			return ["10001100010", 38];
			break;
		case "G":
			return ["11010001000", 39];
			break;
		case "H":
			return ["11000101000", 40];
			break;
		case "I":
			return ["11000100010", 41];
			break;
		case "J":
			return ["10110111000", 42];
			break;
		case "K":
			return ["10110001110", 43];
			break;
		case "L":
			return ["10001101110", 44];
			break;
		case "M":
			return ["10111011000", 45];
			break;
		case "N":
			return ["10111000110", 46];
			break;
		case "O":
			return ["10001110110", 47];
			break;
		case "P":
			return ["11101110110", 48];
			break;
		case "Q":
			return ["11010001110", 49];
			break;
		case "R":
			return ["11000101110", 50];
			break;
		case "S":
			return ["11011101000", 51];
			break;
		case "T":
			return ["11011100010", 52];
			break;
		case "U":
			return ["11011101110", 53];
			break;
		case "V":
			return ["11101011000", 54];
			break;
		case "W":
			return ["11101000110", 55];
			break;
		case "X":
			return ["11100010110", 56];
			break;
		case "Y":
			return ["11101101000", 57];
			break;
		case "Z":
			return ["11101100010", 58];
			break;
		case "[":
			return ["11100011010", 59];
			break;
		case "\\":
			return ["11101111010", 60];
			break;
		case "]":
			return ["11001000010", 61];
			break;
		case "^":
			return ["11110001010", 62];
			break;
		case "_":
			return ["10100110000", 63];
			break;
		case "`":
			return ["10100001100", 64];
			break;
		case "a":
			return ["10010110000", 65];
			break;
		case "b":
			return ["10010000110", 66];
			break;
		case "c":
			return ["10000101100", 67];
			break;
		case "d":
			return ["10000100110", 68];
			break;
		case "e":
			return ["10110010000", 69];
			break;
		case "f":
			return ["10110000100", 70];
			break;
		case "g":
			return ["10011010000", 71];
			break;
		case "h":
			return ["10011000010", 72];
			break;
		case "i":
			return ["10000110100", 73];
			break;
		case "j":
			return ["10000110010", 74];
			break;
		case "k":
			return ["11000010010", 75];
			break;
		case "l":
			return ["11001010000", 76];
			break;
		case "m":
			return ["11110111010", 77];
			break;
		case "n":
			return ["11000010100", 78];
			break;
		case "o":
			return ["10001111010", 79];
			break;
		case "p":
			return ["10100111100", 80];
			break;
		case "q":
			return ["10010111100", 81];
			break;
		case "r":
			return ["10010011110", 82];
			break;
		case "s":
			return ["10111100100", 83];
			break;
		case "t":
			return ["10011110100", 84];
			break;
		case "u":
			return ["10011110010", 85];
			break;
		case "v":
			return ["11110100100", 86];
			break;
		case "w":
			return ["11110010100", 87];
			break;
		case "x":
			return ["11110010010", 88];
			break;
		case "y":
			return ["11011011110", 89];
			break;
		case "z":
			return ["11011110110", 90];
			break;
		case "{":
			return ["11110110110", 91];
			break;
		case "|":
			return ["10101111000", 92];
			break;
		case "}":
			return ["10100011110", 93];
			break;
		case "~":
			return ["10001011110", 94];
			break;
		default:
			return ["Err"];
	}
}

function drawBarcode(barcode) {
	for (var i = 0; i < barcode.length; i++) {
		context.beginPath();
		if (barcode[i] == "1") {
			context.lineWidth = "2";
			context.strokeStyle = "#000000";
			context.rect(i*2, 0, 0, 96);
		} else {
			context.lineWidth = "2";
			context.strokeStyle = "#FFFFFF";
			context.rect(i*2, 0, 0, 96);
		}
		context.stroke();
	}
}
function checkSum(stop) {
	var check = [["11011001100", 0],
				 ["11001101100", 1],
				 ["11001100110", 2],
				 ["10010011000", 3],
				 ["10010001100", 4],
				 ["10001001100", 5],
				 ["10011001000", 6],
				 ["10011000100", 7],
				 ["10001100100", 8],
				 ["11001001000", 9],
				 ["11001000100", 10],
				 ["11000100100", 11],
				 ["10110011100", 12],
				 ["10011011100", 13],
				 ["10011001110", 14],
				 ["10111001100", 15],
				 ["10011101100", 16],
				 ["10011100110", 17],
				 ["11001110010", 18],
				 ["11001011100", 19],
				 ["11001001110", 20],
				 ["11011100100", 21],
				 ["11001110100", 22],
				 ["11101101110", 23],
				 ["11101001100", 24],
				 ["11100101100", 25],
				 ["11100100110", 26],
				 ["11101100100", 27],
				 ["11100110100", 28],
				 ["11100110010", 29],
				 ["11011011000", 30],
				 ["11011000110", 31],
				 ["11000110110", 32],
				 ["10100011000", 33],
				 ["10001011000", 34],
				 ["10001000110", 35],
				 ["10110001000", 36],
				 ["10001101000", 37],
				 ["10001100010", 38],
				 ["11010001000", 39],
				 ["11000101000", 40],
				 ["11000100010", 41],
				 ["10110111000", 42],
				 ["10110001110", 43],
				 ["10001101110", 44],
				 ["10111011000", 45],
				 ["10111000110", 46],
				 ["10001110110", 47],
				 ["11101110110", 48],
				 ["11010001110", 49],
				 ["11000101110", 50],
				 ["11011101000", 51],
				 ["11011100010", 52],
				 ["11011101110", 53],
				 ["11101011000", 54],
				 ["11101000110", 55],
				 ["11100010110", 56],
				 ["11101101000", 57],
				 ["11101100010", 58],
				 ["11100011010", 59],
				 ["11101111010", 60],
				 ["11001000010", 61],
				 ["11110001010", 62],
				 ["10100110000", 63],
				 ["10100001100", 64],
				 ["10010110000", 65],
				 ["10010000110", 66],
				 ["10000101100", 67],
				 ["10000100110", 68],
				 ["10110010000", 69],
				 ["10110000100", 70],
				 ["10011010000", 71],
				 ["10011000010", 72],
				 ["10000110100", 73],
				 ["10000110010", 74],
				 ["11000010010", 75],
				 ["11001010000", 76],
				 ["11110111010", 77],
				 ["11000010100", 78],
				 ["10001111010", 79],
				 ["10100111100", 80],
				 ["10010111100", 81],
				 ["10010011110", 82],
				 ["10111100100", 83],
				 ["10011110100", 84],
				 ["10011110010", 85],
				 ["11110100100", 86],
				 ["11110010100", 87],
				 ["11110010010", 88],
				 ["11011011110", 89],
				 ["11011110110", 90],
				 ["11110110110", 91],
				 ["10101111000", 92],
				 ["10100011110", 93],
				 ["10001011110", 94],
			     ["10111101000", 95],
				 ["10111100010", 96],
				 ["11110101000", 97],
				 ["11110100010", 98],
				 ["10111011110", 99],
				];
	for (var i = 0; i < check.length; i++) {
		if (check[i][1] == stop) {
			return check[i][0];
		}
	}
}