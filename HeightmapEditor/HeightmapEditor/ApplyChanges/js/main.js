(function () {

console.log("Apply changes started");

 var csInterface = new CSInterface();

 var gBaseInfo = {};
 var gSubstracterInfo = {};

 var gBaseIndexLayer = 0;
 var gSubstracterIndexLayer = 1;

 var gImageBaseData = new Image();
 var gImageSubstracterData = new Image();


 var gCanvas = document.createElement('canvas');
 var gBCanvas = document.createElement("CANVAS");
 var gSCanvas = document.createElement('canvas');

 var gContext = gCanvas.getContext("2d");
 var gBContext = gBCanvas.getContext("2d");
 var gSContext = gSCanvas.getContext("2d");


 function init() {

   try {

     csInterface.addEventListener("com.fenikkel.event.applyChanges", getEventData); //obtenemos toda la informacion necesaria para pintar el canvas y procesarlo


     //SI NO FUNCIONA, SUBIR TIEMPOS
     setTimeout(function () {
       //alert(gBaseInfo.height);
       //alert(gSubstracterInfo.width);
       processCanvas();
       //substract(); //no porque  process canvas trabaja paralelamente y aun no estan cargados los canvas
       setTimeout(function () {
         substract();
         decodeData();
       }, 500)
     }, 500)

     setTimeout(function () {
       alert("cerramos")
       csInterface.closeExtension();
     }, 6000)

   } catch(e) {
     alert(e.line + " - " + e);
   }

 }

function substract(){

  gContext.fillStyle = "#111111";

  gContext.fillRect(0, 0, gCanvas.width, gCanvas.height); //relleno todo el canvas de amarillo

  gContext = gCanvas.getContext("2d");
  gBContext = gBCanvas.getContext("2d");
  gSContext = gSCanvas.getContext("2d");

  var baseData = gBContext.getImageData(0, 0, gBCanvas.width, gBCanvas.height);
  var substracterData = gSContext.getImageData(0, 0,  gSCanvas.width, gSCanvas.height);
  var finalData = gContext.getImageData(0, 0,  gCanvas.width, gCanvas.height);

  var dataIdx = 0;

  var red = 0;
  var green = 0;
  var blue = 0;
  var alpha = 0;

  while (dataIdx < baseData.data.length) {

      red = baseData.data[dataIdx] - substracterData.data[dataIdx]; //Red
      green = baseData.data[dataIdx+1] - substracterData.data[dataIdx+1]; //Green
      blue = baseData.data[dataIdx+2] - substracterData.data[dataIdx+2]; //Blue

      if(baseData.data[dataIdx+3] > substracterData.data[dataIdx+3]){

        alpha = substracterData.data[dataIdx+3]; //alpha

      }
      else{
        alpha = baseData.data[dataIdx+3];
      }


      if(red < 0){
        finalData.data[dataIdx] = 0;
      }
      else{
        finalData.data[dataIdx] = red;
      }
      if(green < 0){
        finalData.data[dataIdx+1] = 0;
      }
      else{
        finalData.data[dataIdx+1] = green;
      }
      if(blue < 0){
        finalData.data[dataIdx+2] = 0;
      }
      else{
        finalData.data[dataIdx+2] = blue;
      }

      finalData.data[dataIdx+3] = alpha;

      dataIdx = dataIdx + 4; //pintamos de 4 pixeles en 4

  }

  gContext.putImageData(finalData, 0, 0);

}

function decodeData(){
  var decodedStr = window.atob(gCanvas.toDataURL("image/png",1).replace(/^.+\,/g,"")); // window.atob decodifica : https://www.w3schools.com/jsref/met_win_atob.asp
  //Explicacion sobre las URLs (URIs) y porque estan codificadas https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
  //replace(/g es modo global) --> https://www.w3schools.com/jsref/jsref_replace.asp
  //vamos que decodedStr es una data URI que indica el formato de imagen y la compresion
  csInterface.evalScript("canvasToLayer(\""+escape(decodedStr)+"\")", canvasToLayerCallback); //se llamara la funcion del .jsx que esta dentro la carpeta jsx y el resultado seran las variables de la otra funcion
  //escape() --> encode a string --> https://www.w3schools.com/jsref/jsref_escape.asp
}

function canvasToLayerCallback(in_msg){

  if (in_msg  == "true") {
		csInterface.evalScript("openInLayer()",openInLayerCallback);
	} else {
		csInterface.evalScript("alert('Could not create the substract file!)");
		csInterface.closeExtension();
	}


}

function openInLayerCallback(in_msg){
  if (in_msg  == "false") {
    csInterface.evalScript("alert('Could not open substract file in a layer!)");
  }
  csInterface.closeExtension();
}

function processCanvas(){

  gCanvas.width = parseFloat(gBaseInfo.width);
  gCanvas.height = parseFloat(gBaseInfo.height);

  gBCanvas.width = parseFloat(gBaseInfo.width);
  gBCanvas.height = parseFloat(gBaseInfo.height);



  gSCanvas.width = parseFloat(gBaseInfo.width);
  gSCanvas.height = parseFloat(gBaseInfo.height);

  document.body.appendChild(gBCanvas);
  document.body.appendChild(gSCanvas);
  document.body.appendChild(gCanvas);
  gContext.fillStyle = "#FFFF00";
  gContext.fillRect(0, 0, 500, 500);


  gImageBaseData.onload = function () {
    gBContext.drawImage(gImageBaseData, 0, 0, gBCanvas.width, gBCanvas.height);
  };
  gImageBaseData.src = gBaseInfo.url;


  gImageSubstracterData.onload = function () {
    gSContext.drawImage(gImageSubstracterData, 0, 0, gSCanvas.width, gSCanvas.height);

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
