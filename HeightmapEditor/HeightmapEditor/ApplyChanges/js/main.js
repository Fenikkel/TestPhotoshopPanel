(function () {

console.log("Apply changes started");

 var csInterface = new CSInterface(); //crea una instancia de CSInterface

 var gPreviewInfo;

 function init() {


   try {
     createPreviewFile();
     //csInterface.addEventListener("com.fenikkel.event.applyChanges", getPreviewInfoCallback); //se añade un evento al principio que si es llamado desde el main de la UI como dispatchEvent("com.adobe.event.applyDissolve", JSON.stringify(gPreviewInfo)) se ejecutara
   } catch(e) {
     alert(e.line + " - " + e);
   }


  setTimeout(function () { //TEMPORAL
    alert("CERRANDO");
    csInterface.closeExtension();

  }, 4000)

 }

 function getPreviewInfoCallback (event) {
   if (event) {
     //alert("hallo");
     gPreviewInfo = event.data;
     //gHasSelection = (gPreviewInfo.selection.url.length > 0);
     alert(gPreviewInfo);
     prepareEvent("com.fenikkel.event.unloadUIPanel");
     createPreviewFile();

   } else {
     alert("cerramos extension");
     csInterface.closeExtension();
   }
 }


 function prepareEvent(in_eventStr,in_data) { //hacemos un evento de photoshop para poder llamarlo desde el otro panel(el invisible)
   var msgEvent = new CSEvent(in_eventStr);
   msgEvent.scope = "APPLICATION";
   msgEvent.data = in_data;
   msgEvent.appId = csInterface.getApplicationID();
   msgEvent.extensionId = csInterface.getExtensionID();
   csInterface.dispatchEvent(msgEvent);
 }

//Crea un png en tmp con el resultado final del preview
 function createPreviewFile (event) {
   var finalCanvas = $('#cnvsFinal')[0]; //en el nuevo indel.html no esta este canvas ^^'
   var context = finalCanvas.getContext('2d');

   var decodedStr = window.atob(finalCanvas.toDataURL("image/png",1).replace(/^.+\,/g,""));
   csInterface.evalScript("storeHeightmapImage(\""+escape(decodedStr)+"\")", storeHeightmapImageCallback);
 }

 function storeHeightmapImageCallback (in_msg) {
 	if (in_msg  == "true") {
 		csInterface.evalScript("applyChanges()",applyChangesCallback); 
 	} else {
 		csInterface.evalScript("alert('Could not create the dissolve file!)");
 		csInterface.closeExtension();
 	}
 }

 function applyChangesCallback (in_msg) {
 	if (in_msg  == "false") {
 		csInterface.evalScript("alert('Could not apply the changes!)");
 	}
  alert("se ha creado");
 	csInterface.closeExtension();
 }


 init();

}());
