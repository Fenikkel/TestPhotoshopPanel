(function () {

console.log("Apply changes started");

 var csInterface = new CSInterface(); //crea una instancia de CSInterface

 var gPreviewInfo;

 function init() {


   try {
     //csInterface.addEventListener("com.fenikkel.event.applyChanges", getPreviewInfoCallback); //se añade un evento al principio que si es llamado desde el main de la UI como dispatchEvent("com.adobe.event.applyDissolve", JSON.stringify(gPreviewInfo)) se ejecutara
   } catch(e) {
     alert(e.line + " - " + e);
   }


  /*setTimeout(function () { //TEMPORAL
    alert("CERRANDO");
    csInterface.closeExtension();

  }, 4000)*/

 }

 function getPreviewInfoCallback (event) {
   if (event) {
     //alert("hallo");
     gPreviewInfo = event.data;
     //gHasSelection = (gPreviewInfo.selection.url.length > 0);
     alert(gPreviewInfo);
     prepareEvent("com.fenikkel.event.unloadUIPanel");

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




 init();

}());
