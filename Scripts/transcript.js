var jsonObj = "";

var request = new XMLHttpRequest();
request.onreadystatechange = function() {
	if (this.readyState == 4 && (this.status == 200 || this.status == 304)) {
		jsonObj = JSON.parse(request.responseText);
		render();
	}
}
request.open("GET", "https://rkim3-emich.github.io/Resources/transcript.json", true);
request.send();

function render() {
	var body = document.getElementById("content");

	var header = document.createElement("H3");
	header.append("Credit Overview");
	body.appendChild(header);

	var table = document.createElement("TABLE");
	for (var e = 0; e < 2; e++) {
		var type = ["titles", "data"];
		var row = document.createElement("TR");
		
		for (var i = 0; i < jsonObj["creditInfo"][type[e]].length; i++) {
			var th = document.createElement("TH");
			th.append(jsonObj["creditInfo"][type[e]][i]);
			row.appendChild(th);
		}
		table.appendChild(row);
	}
	body.appendChild(table);

	for (var i = 0; i < jsonObj["semesters"].length; i++) {
		var semester = jsonObj[jsonObj["semesters"][i]];

		header = document.createElement("H3");
		header.append(semester["semester"]);
		body.appendChild(header);

		for (var e = 0; e < semester["classKeys"].length; e++) {
			var sclass = semester[semester["classKeys"][e]];

			if (sclass["emich"]) {
				var dispDiv = document.createElement("DIV");

				var title = document.createElement("P");
				title.append(sclass["id"] + " - " + sclass["title"]);
				title.style.display = "inline";
				dispDiv.appendChild(title);

				var input = document.createElement("INPUT");
				input.value = "+";
				input.setAttribute("type", "button");
				input.tar = semester["classKeys"][e];
				input.addEventListener("click", expand);
				dispDiv.appendChild(input);
				body.appendChild(dispDiv);

				var hidDiv = document.createElement("DIV");
				hidDiv.setAttribute("id", semester["classKeys"][e]);
				hidDiv.style.display = "none";

				var h4 = document.createElement("H4");
				h4.append("Description");
				hidDiv.appendChild(h4);

				var description = document.createElement("p");
				description.textContent = sclass["description"];
				hidDiv.appendChild(description);

				var dataheads = ["Grade", "Credit Hours", "Quality Points"];
				table = document.createElement("TABLE");
				row = document.createElement("TR");
				for (var f = 0; f < dataheads.length; f++) {
					th = document.createElement("TH");
					th.append(dataheads[f]);
					row.appendChild(th);
				}
				table.appendChild(row);
				row = document.createElement("TR");
				
				for (var f = 0; f < sclass["data"].length; f++) {
					var td = document.createElement("TD");
					td.append(sclass["data"][f]);
					row.appendChild(td);
				}
				table.appendChild(row);
				hidDiv.appendChild(table);

				body.appendChild(hidDiv);
			} else {
				var dispDiv = document.createElement("DIV");

				var title = document.createElement("P");
				title.append( sclass["id"] + " - " + sclass["title"]);
				title.style.display = "inline";
				dispDiv.appendChild(title);
				body.appendChild(dispDiv);
			}
		}
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