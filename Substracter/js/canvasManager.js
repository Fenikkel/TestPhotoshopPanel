var gSubstractButton = document.getElementById("btn_substract");

 var gCanvasContext = $('#cnvsPreview')[0].getContext("2d");
 var gCanvasContext2 = $('#cnvsPreview2')[0].getContext("2d");

 var gImageData = new Image();
  var gImageSubstracterData = new Image();

var gBasePreviewInfo = {};
var gSubstracterPreviewInfo = {};
var gBasePrevName = "";
var gSubstracterPrevName = "";


 var gWidthAspectRatio = 1; //aspect ratio
 var gFittedRectangle = { //rectangulo que respeta el aspect ratio de la imagen pero que no supera en ancho el canvas
   x: 0,
   y: 0,
   width: 0,
   height: 0
 };

/**************************************************************************************************************************************************/

function init() {
  //paintCanvas();
}

/*******************************************************************PAINT*******************************************************************/

function paintBaseCanvas(){
  gImageData.src = "";

  csInterface.evalScript("readPreviewInfo(\"" +  gBasePrevName + "\")", drawBasePreview);
}

function paintSubstracterCanvas(){
  gImageSubstracterData.src = "";

  csInterface.evalScript("readPreviewInfo(\"" +  gSubstracterPrevName + "\")", drawSubstracterPreview);
}

/**************************************************************************************************************************************************/

function drawBasePreview(in_resultStr) {

  if (in_resultStr !== 'false') { //si hay previewInfo
    gBasePreviewInfo = {};
    eval("gBasePreviewInfo = " + in_resultStr); //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/eval
    drawImage(gBasePreviewInfo.url);
  }
}


function drawSubstracterPreview(in_resultStr) {

  if (in_resultStr !== 'false') { //si hay previewInfo
    gSubstracterPreviewInfo = {};
    eval("gSubstracterPreviewInfo = " + in_resultStr);
    drawSubstracterImage(gSubstracterPreviewInfo.url);
  }
}

/**************************************************************************************************************************************************/


function drawImage(imagePath) {

    gCanvasContext.clearRect(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height()));
    gCanvasContext.fillStyle = "#00FABA";
    gCanvasContext.fillRect(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height()));

    gImageData = new Image();

    gImageData.onload = function () { //Se hace esta funcion cuando se carga la imagen/objeto (util porque sino muchos atributos no estan actualizados)  // https://www.w3schools.com/jsref/event_onload.asp

        calculateFittedRectangle(gImageData, '#cnvsPreview');

        gCanvasContext.fillStyle = "#FABA00";
        gCanvasContext.fillRect(gFittedRectangle.x, gFittedRectangle.y, gFittedRectangle.width, gFittedRectangle.height);
        gCanvasContext.drawImage(gImageData, gFittedRectangle.x, gFittedRectangle.y, gFittedRectangle.width, gFittedRectangle.height); //context.drawImage(img,x,y,width,height);

        var previewData = gCanvasContext.getImageData(gFittedSelectionRect.x, gFittedSelectionRect.y, gFittedSelectionRect.width, gFittedSelectionRect.height);
        gCanvasContext.putImageData(previewData, 0, 0);

    };

    gImageData.src = imagePath; //con esto se activara el onLoad
}

function drawSubstracterImage(imagePath) {

    gCanvasContext2.clearRect(0, 0, $('#cnvsPreview2').width(), ($('#cnvsPreview2').height()));
    gCanvasContext2.fillStyle = "#00FABA";
    gCanvasContext2.fillRect(0, 0, $('#cnvsPreview2').width(), ($('#cnvsPreview2').height()));
    
    gImageSubstracterData = new Image();

    gImageSubstracterData.onload = function () {

        calculateFittedRectangle(gImageSubstracterData, '#cnvsPreview2');

        gCanvasContext2.fillStyle = "#FABA00";
        gCanvasContext2.fillRect(gFittedRectangle.x, gFittedRectangle.y, gFittedRectangle.width, gFittedRectangle.height);
        gCanvasContext2.drawImage(gImageSubstracterData, gFittedRectangle.x, gFittedRectangle.y, gFittedRectangle.width, gFittedRectangle.height);

        var previewData = gCanvasContext2.getImageData(gFittedSelectionRect.x, gFittedSelectionRect.y, gFittedSelectionRect.width, gFittedSelectionRect.height);
        gCanvasContext2.putImageData(previewData, 0, 0);

    };

    gImageSubstracterData.src = imagePath; //con esto se activara el onLoad
}

/**************************************************************************************************************************************************/


function paintBaseCanvas(){
  gImageData.src = "";

  csInterface.evalScript("readPreviewInfo(\"" +  gBasePrevName + "\")", drawBasePreview);


}

function paintSubstracterCanvas(){
  gImageSubstracterData.src = "";

  csInterface.evalScript("readPreviewInfo(\"" +  gSubstracterPrevName + "\")", drawSubstracterPreview);
}

/**************************************************************************************************************************************************/


function setBasePrevName(str){
    gBasePrevName = str;
  return ;
}

function setSubstracterPrevName(str){
    gSubstracterPrevName = str;
  return ;
}

/**************************************************************************************************************************************************/

function calculateFittedRectangle(imageData, canvasPreviewID){

  var imageWidth = imageData.width;
  var imageHeight = imageData.height;

  var cnvsHeight = $(canvasPreviewID).height(); //Selector -> https://stackoverflow.com/questions/2167544/what-does-the-function-do-in-javascript/2167561#2167561 --> funcion de jQuery
  var cnvsWidth = $(canvasPreviewID).width();

  var fittedSize = rescaleForFit({ //llamamos nuestra funcion rescaleforfit con los tamaños del canvas y del preview para hacer el preview proporcional al canvas
    width: cnvsWidth,
    height: cnvsHeight
  }, {
    width: imageWidth,
    height: imageHeight
  });

  gFittedRectangle.width = fittedSize.width;
  gFittedRectangle.height = fittedSize.height;
  gWidthAspectRatio = gFittedRectangle.width / imageWidth;

  gFittedRectangle.x = Math.floor(($(canvasPreviewID).width() - gFittedRectangle.width) / 2); //decimos que empiece en una posicion en concreto para centrarlo en el canvas
  gFittedRectangle.y = Math.floor(($(canvasPreviewID).height() - gFittedRectangle.height) / 2);

}

function rescaleForFit(in_rect, in_img) {
  var retVal = in_img; //si la imagen cabe dentro del canvas no hay problema
  if (in_img.width > in_rect.width || in_img.height > in_rect.height) { //si la imagen es mayor que el canvas en altura o en anchura ...
    var rectRatio = in_rect.height / in_rect.width; //miramos el aspect ratio del rectangulo
    var imgRation = in_img.height / in_img.width; //miramos el aspect ratio de la imagen
    if (rectRatio > imgRation) {  //si el canvas es mas alto en cuanto aspect ratio(altura/ancho) que la imagen preview...
      var ratio = (in_rect.width / in_img.width); //obtenemos el ratio que tendria que ser la imagen
    } else {
      var ratio = (in_rect.height / in_img.height);
    }
    retVal.width = Math.floor(retVal.width * ratio); //y se lo aplicamos
    retVal.height = Math.floor(retVal.height * ratio);
  }
  return retVal;
}

/**************************************************************************************************************************************************/

function paintCanvas(){
  gCanvasContext2.fillStyle = "#FFBB00";


  gCanvasContext2.fillRect(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height())); //relleno todo el canvas de amarillo
}

init();
