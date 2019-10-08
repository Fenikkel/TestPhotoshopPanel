
//Ponemos el script en el stack del menu filter
/*
// BEGIN__HARVEST_EXCEPTION_ZSTRING
<javascriptresource>
<name>Heightmap Editor...</name>
<menu>filter</menu>
<eventid>6F17BFA7-EFC8-11EA-B850-7B95ED8EA713</eventid>
<category>filter</category>
</javascriptresource>
// END__HARVEST_EXCEPTION_ZSTRING
*/

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

	if else(activeDocument.height != activeDocument.width){
		alert("The document size must be 1:1 (same height and width)");
	}
	else{
			loadPanel();
	}
}

function loadPanel() { //Cargamos el panel editor
		var eventObj = new CSXSEvent();
		eventObj.type = "com.fenikkel.event.loadHeightmapsEditor";
		eventObj.message = ""
		eventObj.dispatch()
}
