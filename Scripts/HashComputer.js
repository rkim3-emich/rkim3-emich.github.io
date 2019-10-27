const forge = window.forge;
var holder = document.getElementById('holder');
var drop_zone = document.getElementById('drop_zone');

function generateFileHash() {
	var typeOfHash = check("file");
      
  switch(typeOfHash) {
  	case 1:
  		var file = event.dataTransfer.files[0];
		  var reader = new FileReader();
		
		  reader.onload = function(event) {
		    var binary = event.target.result;
		    var md = forge.md.sha1.create();  
		    md.start();  
		    md.update(binary.toString(), "utf8");  
		    var hashText = md.digest().toHex();  
				document.getElementById("hashFileText").innerHTML = hashText;
		  };

			reader.readAsBinaryString(file);
 			break;
 		case 2:
 			var file = event.dataTransfer.files[0];
		  var reader = new FileReader();
		
		  reader.onload = function(event) {
		    var binary = event.target.result;
		    var md = forge.md.sha256.create();  
		    md.start();  
		    md.update(binary.toString(), "utf8");  
		    var hashText = md.digest().toHex();  
				document.getElementById("hashFileText").innerHTML = hashText;
		  };

			reader.readAsBinaryString(file);
 			break;
 		case 3:
 			var file = event.dataTransfer.files[0];
		  var reader = new FileReader();
		
		  reader.onload = function(event) {
		    var binary = event.target.result;
		    var md = forge.md.sha384.create();  
		    md.start();  
		    md.update(binary.toString(), "utf8");  
		    var hashText = md.digest().toHex();  
				document.getElementById("hashFileText").innerHTML = hashText;
		  };

			reader.readAsBinaryString(file);
 			break;
  	case 4:
  		var file = event.dataTransfer.files[0];
		  var reader = new FileReader();
		
		  reader.onload = function(event) {
		    var binary = event.target.result;
		    var md = forge.md.sha512.create();  
		    md.start();  
		    md.update(binary.toString(), "utf8");  
		    var hashText = md.digest().toHex();  
				document.getElementById("hashFileText").innerHTML = hashText;
		  };

			reader.readAsBinaryString(file);
 			break;
  	case 5:
  		var file = event.dataTransfer.files[0];
		  var reader = new FileReader();
		
		  reader.onload = function(event) {
		    var binary = event.target.result;
		    var md = forge.md.md5.create();  
		    md.start();  
		    md.update(binary.toString(), "utf8");  
		    var hashText = md.digest().toHex();  
				document.getElementById("hashFileText").innerHTML = hashText;
		  };

			reader.readAsBinaryString(file);
 			break;
  }
}
function generateHash()
{
    var plainText = document.getElementById('plainText').value;
    var typeOfHash = check("text");
    
    switch(typeOfHash) {
    	case 1:
    		var md = forge.md.sha1.create();  
    		md.start();  
    		md.update(plainText, "utf8");  
    		var hashText = md.digest().toHex();  
   			document.getElementById("hashText").innerHTML = hashText;
   			break;
   		case 2:
   			var md = forge.md.sha256.create();  
    		md.start();  
    		md.update(plainText, "utf8");  
    		var hashText = md.digest().toHex();  
   			document.getElementById("hashText").innerHTML = hashText;
   			break;
   		case 3:
   			var md = forge.md.sha384.create();  
    		md.start();  
    		md.update(plainText, "utf8");  
    		var hashText = md.digest().toHex();  
    		document.getElementById("hashText").innerHTML = hashText;
    		break;
    	case 4:
    		var md = forge.md.sha512.create();  
    		md.start();  
    		md.update(plainText, "utf8");  
    		var hashText = md.digest().toHex();  
    		document.getElementById("hashText").innerHTML = hashText;
    		break;
    	case 5:
    		var md = forge.md.md5.create();  
   			md.start();  
    		md.update(plainText, "utf8");  
    		var hashText = md.digest().toHex();  
    		document.getElementById("hashText").innerHTML = hashText;
    		break;
    }
}
  
function check(info) {
	console.log(info);
	var sha1 = document.getElementById(info + "sha1");
	var sha256 = document.getElementById(info + "sha256");
	var sha384 = document.getElementById(info + "sha384");
	var sha512 = document.getElementById(info + "sha512");
	var md5 = document.getElementById(info + "md5");
	
	if (sha1.checked == true) {
		return 1;
	}
	else if (sha256.checked == true) {
		return 2;
	}
	else if (sha384.checked == true) {
		return 3;
	}
	else if (sha512.checked == true) {
		return 4;
	}
	else if (md5.checked == true) {
		return 5;
	}
}  

drop_zone.ondragover = function() {
  return false;
};

drop_zone.ondragend = function() {
  return false;
};

drop_zone.ondrop = function(event) {
  event.preventDefault();

  generateFileHash("file");
};
