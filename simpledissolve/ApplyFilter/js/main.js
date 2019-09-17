
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2014 Adobe Inc.
* All Rights Reserved.
*
* NOTICE: Adobe permits you to use, modify, and distribute this file in
* accordance with the terms of the Adobe license agreement accompanying
* it. If you have received this file from a source other than Adobe,
* then your use, modification, or distribution of it requires the prior
* written permission of Adobe.
**************************************************************************/

(function () {
	console.log("SDS started")
	var csInterface = new CSInterface();
	var gHasSelection = false;
	var gPreviewInfo = null;

//------------------------------------------------------------------------------
// init - add event listeners
//------------------------------------------------------------------------------

	function init() {
		csInterface.addEventListener("com.adobe.event.applyDissolve", getPreviewInfoCallback); //se añade un evento al principio que si es llamado desde el main de la UI como dispatchEvent("com.adobe.event.applyDissolve", JSON.stringify(gPreviewInfo)) se ejecutara
	}

//------------------------------------------------------------------------------
// getPreviewInfoCallback - Triggered by the event:
// com.adobe.event.applySimpleDissolve
// Event sent by the SimpleDissolve extension once the user has clicked OK
//------------------------------------------------------------------------------

	function getPreviewInfoCallback (event) {
		if (event) {
			gPreviewInfo = event.data;
			gHasSelection = (gPreviewInfo.selection.url.length > 0);
			dispatchEvent("com.adobe.event.unloadDissolveExtension"); //cerramos el UI
			createDissolveFile();
		} else {
			csInterface.closeExtension();
		}
	}

//------------------------------------------------------------------------------
// doDissolvePixel - decides if a pixel should be colored or not
//------------------------------------------------------------------------------

	function doDissolvePixel () {
		var rand = Math.floor((Math.random() * 100) + 1);
		return ( rand <= parseFloat(gPreviewInfo.percent));
	}

//------------------------------------------------------------------------------
// createDissolveFile - creates a png with the dissolve effect
// based on the "Disposition" and percentage of dissolve.
//------------------------------------------------------------------------------

	function createDissolveFile (event) {
		var dissolveCanvas = document.createElement('canvas');
		if (gHasSelection) {
			dissolveCanvas.width = parseFloat(gPreviewInfo.selection.rect.width);
			dissolveCanvas.height = parseFloat(gPreviewInfo.selection.rect.height);
		} else {
			dissolveCanvas.width = parseFloat(gPreviewInfo.width);
			dissolveCanvas.height = parseFloat(gPreviewInfo.height);
		}
		var context = dissolveCanvas.getContext('2d');
		var imageData = context.createImageData(dissolveCanvas.width, dissolveCanvas.height);
		var dataIdx = 0;
		while (dataIdx < imageData.data.length) {
			if (doDissolvePixel()) {
				switch(gPreviewInfo.disposition) {
					case "0":
						imageData.data[dataIdx] =  255;
						imageData.data[dataIdx + 1] =  255;
						imageData.data[dataIdx + 2] =  255;
						break;
					case "1":
						imageData.data[dataIdx] =  (gPreviewInfo.isMask == '1' ? 69 : 0);
						imageData.data[dataIdx + 1] =  (gPreviewInfo.isMask == '1' ? 69 : 0);
						imageData.data[dataIdx + 2] =  (gPreviewInfo.isMask == '1' ? 69 : 255);
						break;
					case "2":
						imageData.data[dataIdx] =  (gPreviewInfo.isMask == '1' ? 129 : 255);
						imageData.data[dataIdx + 1] =  (gPreviewInfo.isMask == '1' ? 129 : 0);
						imageData.data[dataIdx + 2] =  (gPreviewInfo.isMask == '1' ? 129 : 0);
						break;
					case "3":
						imageData.data[dataIdx] =  (gPreviewInfo.isMask == '1' ? 200 : 0);
						imageData.data[dataIdx + 1] =  (gPreviewInfo.isMask == '1' ? 200 : 255);
						imageData.data[dataIdx + 2] =  (gPreviewInfo.isMask == '1' ? 200 : 0);
						break;
				}
				imageData.data[dataIdx + 3] =  255;
			}
			dataIdx = dataIdx + 4;
		}
		context.putImageData(imageData, 0, 0); //ponemos solo el dissolve no la imagen
		var decodedStr = window.atob(dissolveCanvas.toDataURL("image/png",1).replace(/^.+\,/g,"")); // window.atob decodifica : https://www.w3schools.com/jsref/met_win_atob.asp
		//Explicacion sobre las URLs (URIs) y porque estan codificadas https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
		//replace(/g es modo global) --> https://www.w3schools.com/jsref/jsref_replace.asp
		//vamos que decodedStr es una data URI que indica el formato de imagen y la compresion
		csInterface.evalScript("storeDissolveImage(\""+escape(decodedStr)+"\")", storeDissolveImageCallback); //se llamara la funcion del .jsx que esta dentro la carpeta jsx y el resultado seran las variables de la otra funcion
//escape() --> encode a string --> https://www.w3schools.com/jsref/jsref_escape.asp
	}

//------------------------------------------------------------------------------
// storeDissolveImageCallback - gets results back from evalScript storeDissolveImage
//------------------------------------------------------------------------------

function storeDissolveImageCallback (in_msg) { //in_msg obtendra verdadero o falso pero en string (que es lo que nos pasa stareDissolveImage). Supongo que entre eventos no se pueden pasar booleanos, solo strings...
	if (in_msg  == "true") {
		csInterface.evalScript("applyDissolve("+(gPreviewInfo.isMask == '1')+")",applyDissolveCallback);
	} else {
		csInterface.evalScript("alert('Could not create the dissolve file!)");
		csInterface.closeExtension();
	}
}

//------------------------------------------------------------------------------
// applyDissolveCallback - gets results back from evalScript applyDissolve
//------------------------------------------------------------------------------

function applyDissolveCallback (in_msg) {
	if (in_msg  == "false") {
		csInterface.evalScript("alert('Could not apply the dissolve!)");
	}
	csInterface.closeExtension();
}

//------------------------------------------------------------------------------
// dispatchEvent - dispatches a CEP event
//------------------------------------------------------------------------------

	function dispatchEvent(in_eventStr,in_data) {
		var msgEvent = new CSEvent(in_eventStr);
		msgEvent.scope = "APPLICATION";
		msgEvent.data = in_data;
		msgEvent.appId = csInterface.getApplicationID();
		msgEvent.extensionId = csInterface.getExtensionID();
		csInterface.dispatchEvent(msgEvent);
	}

init();

}());
