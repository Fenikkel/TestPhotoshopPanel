(function () {

console.log("Apply changes started");

 var csInterface = new CSInterface(); //crea una instancia de CSInterface

 var gBaseInfo = {};
 var gSubstracterInfo = {};

 var gBaseIndexLayer = 0;
 var gSubstracterIndexLayer = 1;

 var gImageBaseData = new Image();
 var gImageSubstracterData = new Image();


 var gCanvas = document.createElement('canvas');
 var gBCanvas = document.createElement("CANVAS");//document.getElementById("cnvsBase");//document.createElement("CANVAS");
 var gSCanvas = document.createElement('canvas');




 function init() {

   try {

     csInterface.addEventListener("com.fenikkel.event.applyChanges", getEventData); //obtenemos toda la informacion necesaria para pintar el canvas y procesarlo

     setTimeout(function () {
       //alert(gBaseInfo.height);
       //alert(gSubstracterInfo.width);
       processCanvas();
     }, 500)
     setTimeout(function () {
       alert("cerramos")
       csInterface.closeExtension();
     }, 4000)

   } catch(e) {
     alert(e.line + " - " + e);
   }

 }

function processCanvas(){

  gCanvas.width = parseFloat(gBaseInfo.width);
  gCanvas.height = parseFloat(gBaseInfo.height);

  gBCanvas.width = parseFloat(gBaseInfo.width);
  gBCanvas.height = parseFloat(gBaseInfo.height);

  gSCanvas.width = parseFloat(gBaseInfo.width);
  gSCanvas.height = parseFloat(gBaseInfo.height);


  var context = gCanvas.getContext("2d");
  var bContext = gBCanvas.getContext("2d");
  var sContext = gSCanvas.getContext("2d");

  //bContext.fillStyle = "#FFFF00";
  //bContext.fillRect(20, 20, 150, 100);

  document.body.appendChild(gBCanvas);
  document.body.appendChild(gSCanvas);
  document.body.appendChild(gCanvas);
  context.fillStyle = "#FFFF00";
  context.fillRect(0, 0, 500, 500);


  gImageBaseData.onload = function () {
    bContext.drawImage(gImageBaseData, 0, 0, gBCanvas.width, gBCanvas.height);
    //updatePreview();
  };
  gImageBaseData.src = gBaseInfo.url;


  gImageSubstracterData.onload = function () {
    sContext.drawImage(gImageSubstracterData, 0, 0, gSCanvas.width, gSCanvas.height);
    //updatePreview();
  };
  gImageSubstracterData.src = gSubstracterInfo.url;

  //alert("base: " + gBaseInfo.url+ "\n" + " substracter" +gSubstracterInfo.url);


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
