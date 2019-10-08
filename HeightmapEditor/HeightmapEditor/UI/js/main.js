(function () {

 var csInterface = new CSInterface(); //crea una instancia de CSInterface

 function init(){
   csInterface.setWindowTitle("Heightmap Editor");

   csInterface.addEventListener("com.adobe.event.unloadDissolveExtension", closeUI);


 }

 function closeUI(event) {

   csInterface.closeExtension();
 }


 function requestApplyChanges(event) {

   try {
     //alert("iep");
     csInterface.requestOpenExtension("com.fenikkel.HeightmapEditor.ApplyChanges", "") //function(extensionId, params)
     setTimeout(function () { //hace la funcion despues de medio segundo
       prepareEvent("com.fenikkel.event.applyChanges", "parametros")
     }, 500)
   } catch(e) {
   	alert(e.line + " - " + e);
   }
 }

 function prepareEvent(in_eventStr,in_data) { //dispatches a CEP event
   var msgEvent = new CSEvent(in_eventStr);
   msgEvent.scope = "APPLICATION";
   msgEvent.data = in_data;
   msgEvent.appId = csInterface.getApplicationID();
   msgEvent.extensionId = csInterface.getExtensionID();
   csInterface.dispatchEvent(msgEvent);
 }

 document.getElementById('btn_test').addEventListener('click', function () { //le añade al boton un eventlistener...

   try {
     alert("testbutton");
     requestApplyChanges();
   } catch(e) {
     alert(e.line + " - " + e);
   }

 });

 init();


}());
