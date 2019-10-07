
#target photoshop

/*********************************/

try {
	var xLib = new ExternalObject("lib:\PlugPlugExternalObject");
	checkProject();
} catch(e) {
	alert(e.line + " - " + e);
}

/*********************************/

function checkProject(){

	if(activeDocument.mode != DocumentMode.GRAYSCALE){
		alert("The document color mode must be in grayscale for start the plugin");
	}

	else if(activeDocument.height != activeDocument.width){
		alert("The document size must be 1:1 (same height and width)");
	}
	else{
		//alert("Funciona");

	}

	//loadPanel();

}

/*
function loadPanel() { //como que hace un evento...
		var eventObj = new CSXSEvent();
		eventObj.type = "com.fenikkel.event.loadHeightmapsEditor";
		eventObj.message = ""
		eventObj.dispatch()
}
*/
