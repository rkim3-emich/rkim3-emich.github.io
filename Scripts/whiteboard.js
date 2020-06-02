var whiteboard = document.getElementById("canvas");
var context = whiteboard.getContext("2d");
var color = document.getElementById("colorpicker");
var width = document.getElementById("width");
var drawing = false;
var prev = [0,0];

resizeWhiteboard();

whiteboard.addEventListener("mousedown", function(e) {
	drawing = true;
	prev = getMousePos(e);
	context.beginPath();
	context.moveTo(prev[0], prev[1]);
});
whiteboard.addEventListener("mousemove", function(e) {
	if (drawing) {
		var coords = getMousePos(e);
		console.log(coords);
		context.strokeStyle = color.value;
		context.lineWidth = width.value;
		context.lineTo(coords[0], coords[1]);
		context.stroke();
		context.moveTo(coords[0], coords[1]);
	}
});
whiteboard.addEventListener("mouseup", function() {
	drawing = false;
});
whiteboard.addEventListener("mouseout", function() {
	drawing = false;
});

function getMousePos(e) {
	var event;
	if (e == undefined){
		event = window.event;
		return [event.clientX, event.clientY];
	} else {
		event = e;
		var rect = e.target.getBoundingClientRect();
		return [Math.round(event.clientX - rect.left), Math.round(event.clientY - rect.top)];
	}
}

function resizeWhiteboard() {
	whiteboard.width = Math.round(.75*window.innerWidth);
	whiteboard.height = Math.round(.6*window.innerHeight);
}