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

 function requestApplyChanges(event) {

   try {
     //alert("iep");
     csInterface.requestOpenExtension("com.fenikkel.HeightmapEditor.ApplyChanges", "") //function(extensionId, params)
    /* setTimeout(function () { //hace la funcion despues de medio segundo
       prepareEvent("com.fenikkel.event.applyChanges", "parametros")
     }, 500)
     */
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


 //Crea un png en tmp con el resultado final del preview
  function createPreviewFile (event) {
    var finalCanvas = $('#cnvsFinal')[0]; //en el nuevo indel.html no esta este canvas ^^'
    var context = finalCanvas.getContext('2d');

    var decodedStr = window.atob(finalCanvas.toDataURL("image/png",1).replace(/^.+\,/g,""));
    csInterface.evalScript("storeHeightmapImage(\""+escape(decodedStr)+"\")", storeHeightmapImageCallback);
  }

  function storeHeightmapImageCallback (in_msg) {
  	if (in_msg  == "true") {
      //alert("Paso 1: creado el fichero en tmp");
  		csInterface.evalScript("applyChanges()",applyChangesCallback);
  	} else {
  		csInterface.evalScript("alert('Could not create the dissolve file!)");
  		csInterface.closeExtension();
  	}
  }

  function applyChangesCallback (in_msg) {
  	if (in_msg  == "false") {
  		csInterface.evalScript("alert('Could not apply the changes!)");
  	}else{
      alert("SE HA CREADO");
    }
  	csInterface.closeExtension();
  }


 document.getElementById('btn_test').addEventListener('click', function () { //le añade al boton un eventlistener...

   try {
     //alert("testbutton");
     csInterface.evalScript("newLayer()");
     createPreviewFile(); //TOT COMENÇA ACI


     requestApplyChanges();
   } catch(e) {
     alert(e.line + " - " + e);
   }

 });

 init();


}());
