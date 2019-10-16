(function () {

 var csInterface = new CSInterface(); //crea una instancia de CSInterface

 var gPreviewInfo = {};


 function init(){
   csInterface.setWindowTitle("Heightmap Editor");

   csInterface.addEventListener("com.fenikkel.event.unloadUIPanel", closeUI);
 }

 function drawPreviewCallback(in_resultStr) {
   if (in_resultStr !== 'false') {
     eval("gPreviewInfo = " + in_resultStr);
     alert(gPreviewInfo.string);

   }
   //document.onkeydown = onKeyDownCallbak;
 }

 function closeUI(event) {

   csInterface.closeExtension();
 }



 function prepareEvent(in_eventStr,in_data) { //dispatches a CEP event
   var msgEvent = new CSEvent(in_eventStr);
   msgEvent.scope = "APPLICATION";
   msgEvent.data = in_data;
   msgEvent.appId = csInterface.getApplicationID();
   msgEvent.extensionId = csInterface.getExtensionID();
   csInterface.dispatchEvent(msgEvent);
 }

  function startApplyChanges() {

    try {
      csInterface.requestOpenExtension("com.fenikkel.HeightmapEditor.ApplyChanges", "") //function(extensionId, params)
      setTimeout(function () { //hace la funcion despues de medio segundo
        var layersIndex = {base: gIndexBase,
                          substracter: gIndexSubstracter};
        prepareEvent("com.fenikkel.event.applyChanges", layersIndex);
        closeUI();
      }, 1000)

    } catch(e) {
    	alert(e.line + " - " + e);
    }
  }

 document.getElementById('btn_test').addEventListener('click', function () { //le añade al boton un eventlistener...

   try {
     startApplyChanges();

   } catch(e) {
     alert(e.line + " - " + e);
   }

 });

 init();


}());
