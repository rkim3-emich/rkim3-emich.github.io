var url = document.getElementById("website");
var requestHeaders = document.getElementById("requestHeaders");
var responseHeaders = document.getElementById("responseHeaders");
var responseBody = document.getElementById("responseBody");
var requestInfo = document.getElementById("request");
var requestType = document.getElementById("get");
var eventOccurence = document.getElementById("events");

function submit() {
	var request = new XMLHttpRequest();
	responseHeaders.textContent = "";
	responseBody.textContent = "";
	if ("withCredentials" in request) {
		eventOccurence.textContent = "";
		request.onload = function() {
			eventOccurence.textContent += "Load\n";
		}
		request.onreadystatechange = function() {
			eventOccurence.textContent += "Ready state change: " + this.readyState + ", " + this.status + "\n";
			if (this.readyState == 4 && this.status == 200) {
				responseBody.textContent = request.responseText;
				responseHeaders.textContent = request.getAllResponseHeaders();
			} else if (this.readyState == 4) {
				responseHeaders.textContent = request.getAllResponseHeaders();
			}
		}
		request.onerror = function() {
			eventOccurence.textContent += "Error: " + this.readyState + ", " + this.status + "\n";
		}
		if (url.value.search("http") != 0) {
			url.value = "http://" + url.value
		}
		if (requestType.checked) {
			request.open("GET", url.value, true);
		} else {
			request.open("POST", url.value, true);
		}
		request.send();
	} else if (typeof XDomeainRequest != undefined) {

	} else {
		responseHeaders.textContent("CORS not supported");
	}
	
}

function setHeaders(request) {
	var headersArr = requestHeaders.split("\n");
	for (var i = 0; i < headersArr.length; i++) {
		var header = headersArr[i].split(":");
		request.setRequestHeader(header[0].strip(), header[1].strip);
	}
}