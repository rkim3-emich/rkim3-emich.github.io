var jsonObj = "";
var answer = "";
var userAnswer = document.getElementById("answer");
var lengthdom = document.getElementById("length");

var request = new XMLHttpRequest();
request.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		jsonObj = JSON.parse(request.responseText);
		captchaGen();
	}
}
request.open("GET", "https://rkim3-emich.github.io/Resources/images.json", true);
request.send();
var notify = document.getElementById("notify")

function captchaGen() {
	var length = lengthdom.value;

	if (length > 0) {

		answer = ""
		notify.style.display = "none";
		var canvas = document.getElementById("captcha");
		canvas.style.width = 28*length
		var context = canvas.getContext("2d");

		context.clearRect(0, 0, canvas.width, canvas.height);

		var imgData = context.createImageData(28*length, 28);

		var rawData = jsonObj[0]["imgdata"];

		var rand_numbers = [];
		var rand_images = [];
		for (var i = 0; i < length; i++) {
		    rand = Math.floor(Math.random() * 5000);
		    rand_numbers.push(rand);
		    answer = answer + jsonObj[rand]["label"];
		    rand_images.push(jsonObj[rand]["imgdata"]);
		  }
		captcha = []
		for (var y = 0; y < 28; y++){
		    for (var i = 0; i < length; i++){
		        for (var x = 0; x < 28; x++){
		            captcha.push(rand_images[i][x + 28*y]);
		        }
		    }
		}

		for (var i = 0; i < imgData.data.length; i += 4) {
			imgData.data[i + 0] = captcha[i/4];
			imgData.data[i + 1] = captcha[i/4];
			imgData.data[i + 2] = captcha[i/4];
			imgData.data[i + 3] = 255;
		}

		context.putImageData(imgData, 0, 0)
	}
}

function checkCaptcha() {
	notify.style.display = "block";
	if (userAnswer.value == answer) {
		notify.textContent = "Correct!";
		notify.style.backgroundColor = "#99dd99";
	} else {
		notify.textContent = "Incorrect. Please Try Again";
		notify.style.backgroundColor = "#dd9999";
	}
	
}