var jsonObj = "";

var request = new XMLHttpRequest();
request.onreadystatechange = function() {
	if (this.readyState == 4 && (this.status == 200 || this.status == 304)) {
		jsonObj = JSON.parse(request.responseText);
		render();
	}
}
request.open("GET", "https://rkim3-emich.github.io/Resources/portfolio.json", true);
request.send();

function render() {
	var body = document.getElementById("content");

	var keys = jsonObj["projects"];

	for (var i = 0; i < keys.length; i++) {
		var dispDiv = document.createElement("DIV");

		var p = document.createElement("P");
		var title = document.createElement("STRONG");
		title.textContent = jsonObj[keys[i]]["name"];

		p.appendChild(title);

		p.style.display = "inline";
		dispDiv.appendChild(p);

		var input = document.createElement("INPUT");
		input.value = "+";
		input.setAttribute("type", "button");
		input.tar = keys[i];
		input.addEventListener("click", expand);
		dispDiv.appendChild(input);
		body.appendChild(dispDiv);

		var hidDiv = document.createElement("DIV");
		hidDiv.setAttribute("id", keys[i]);
		hidDiv.style.display = "none";

		var img = document.createElement("IMG");
		img.setAttribute("src", jsonObj[keys[i]]["image"]["source"]);
		img.setAttribute("alt", jsonObj[keys[i]]["image"]["alt"])
		hidDiv.appendChild(img);

		var paragraphs = jsonObj[keys[i]]["paragraphs"];
		for (var e = 0; e < paragraphs.length; e++) {
			var description = document.createElement("p");
			description.innerHTML = paragraphs[i];
			hidDiv.appendChild(description);
		}

		var technologies = jsonObj[keys[i]]["technologies"];

		p = document.createElement("P");
		var strong = document.createElement("STRONG");
		strong.textContent = "Skills Used:"
		p.appendChild(strong);
		hidDiv.appendChild(p);

		var list = document.createElement("UL");
		for (var e = 0; e < technologies.length; e++) {
			var li = document.createElement("LI");
			li.textContent = technologies[e];
			list.appendChild(li);
		}

		hidDiv.appendChild(list);
		body.appendChild(hidDiv);

		var divider = document.createElement("HR");
		divider.setAttribute("class", "divider");
		body.appendChild(divider);
	}
}
function expand(event) {
	var div = document.getElementById(event.currentTarget.tar);

	if (div.style.display == "block") {
		div.style.display = "none";
	} else {
		div.style.display = "block";
	}
}