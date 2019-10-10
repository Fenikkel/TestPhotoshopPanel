(function () {

console.log("Apply changes started");

 var csInterface = new CSInterface(); //crea una instancia de CSInterface

 var gBaseInfo = {};
 var gSubstracterInfo = {};

 var gBaseIndexLayer = 0;
 var gSubstracterIndexLayer = 1;



 function init() {

   try {

     csInterface.addEventListener("com.fenikkel.event.applyChanges", getEventData);

     setTimeout(function () {
       alert("cerramos")
       csInterface.closeExtension();
     }, 4000)

   } catch(e) {
     alert(e.line + " - " + e);
   }

 }


 function getEventData(event){ //Obtenemos los indices de los layers seleccionados en la UI

   gBaseIndexLayer = event.data.base;
   gSubstracterIndexLayer = event.data.substracter;

   csInterface.evalScript("createTmp( \"" +  gBaseIndexLayer + "\""   + "\,"   +    "\""  + gSubstracterIndexLayer  +"\")"); //aqui porque sino no se actualizan las variables gBaseIndexlayer

   csInterface.evalScript("readBaseDataInfo()", readBaseDataCallback);
   csInterface.evalScript("readSubstracterDataInfo()", readSubstracterDataCallback);

}

function readBaseDataCallback(in_resultStr) {
  if (in_resultStr !== 'false') {
    eval("gBaseInfo = " + in_resultStr)
    //alert(gBaseInfo.url);
    //loadPreview();

  }
}

function readSubstracterDataCallback(in_resultStr) {
  if (in_resultStr !== 'false') {
    eval("gSubstracterInfo = " + in_resultStr)
    //alert(gSubstracterInfo.url);
    //loadPreview();

  }
}

 function getPreviewInfoCallback (event) {
   if (event) {
     //alert("hallo");
     gPreviewInfo = event.data;
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
