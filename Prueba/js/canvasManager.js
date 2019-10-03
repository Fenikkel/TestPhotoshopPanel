var gSubstractButton = document.getElementById("btn_substract");

 var gCanvasContext = $('#cnvsPreview')[0].getContext("2d");
 var gImageData = new Image();

 var gBasePreviewInfo = {};


 var gWidthAspectRatio = 1; //aspect ratio
 var gFittedRectangle = { //rectangulo que respeta el aspect ratio de la imagen pero que no supera en ancho el canvas
   x: 0,
   y: 0,
   width: 0,
   height: 0
 };


function init() {
  /*

  gCanvasContext.fillStyle = "#FFFF00";


  gCanvasContext.fillRect(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height())); //relleno todo el canvas de amarillo

  //drawImage("~/AppData/Local/Temp/nombreTemporal.png");
  drawImage("C:/Users/dactic/AppData/Local/Temp/nombreTemporal.png");
  //updatePreview();
  prueba(); //PROBAR PER UNA ULTIMA VEGADA
*/
  //paintCanvas();

}

function drawBasePreview(in_resultStr) {

  //alert(in_resultStr);

  if (in_resultStr !== 'false') { //si hay previewInfo
    gBasePreviewInfo = {};
    eval("gBasePreviewInfo = " + in_resultStr) //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/eval
    //gHasSelection = (gPreviewInfo.selection.url.length > 0);
    //loadPreview();
    /*if (gHasSelection) {
      loadSelection();
    }*/
    drawImage(gBasePreviewInfo.url); //FALLA A PARTIR D'ACI!!!
  }
  //document.onkeydown = onKeyDownCallbak;
}

function paintCanvas(){
  gCanvasContext.fillStyle = "#FFBB00";


  gCanvasContext.fillRect(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height())); //relleno todo el canvas de amarillo
}

function paintBaseCanvas(){
  gImageData.src = "";
  //gImageData = new Image(); //fatal
  //gCanvasContext.clearRect(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height()));
  csInterface.evalScript("readPreviewInfo()", drawBasePreview);


}

function drawImage(imagePath) { //seria mejor otra variable con el nombre del canvas que queremos editar

    //alert(imagePath);

    //gImageData.src = "";
    gCanvasContext.clearRect(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height()));
    gCanvasContext.fillStyle = "#00FABA";
    gCanvasContext.fillRect(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height()));

    gImageData.src = imagePath; //con esto se activara el onLoad
}



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

function prueba(){
  var previewData = gCanvasContext.getImageData(gFittedSelectionRect.x, gFittedSelectionRect.y, gFittedSelectionRect.width, gFittedSelectionRect.height);
  var x = gFittedSelectionRect.x;
  var y = gFittedSelectionRect.y;

  var dataIdx = 0;
  while (dataIdx < previewData.data.length) {
    previewData.data[dataIdx] = 255; //Red
    previewData.data[dataIdx + 1] = 255; //Green
    previewData.data[dataIdx + 2] = 255; //Blue
    previewData.data[dataIdx + 3] = 255; //el canal alpha (transparencias) = totalmente opaco

    dataIdx = dataIdx + 4; //pintamos de 4 pixeles en 4

  }

  gCanvasContext.putImageData(previewData, x, y); //ponemos al preview lo que hemos hecho


}

gImageData.onload = function () { //Se hace esta funcion cuando se carga la imagen/objeto (util porque sino muchos atributos no estan actualizados)  // https://www.w3schools.com/jsref/event_onload.asp

    calculateFittedRectangle(gImageData, '#cnvsPreview');

    gCanvasContext.fillStyle = "#FABA00";
    gCanvasContext.fillRect(gFittedRectangle.x, gFittedRectangle.y, gFittedRectangle.width, gFittedRectangle.height);
    gCanvasContext.drawImage(gImageData, gFittedRectangle.x, gFittedRectangle.y, gFittedRectangle.width, gFittedRectangle.height); //context.drawImage(img,x,y,width,height);
    //gCanvasContext.drawImage(gImageData, 0, 0, gFittedRectangle.width, gFittedRectangle.height);

    var previewData = gCanvasContext.getImageData(gFittedSelectionRect.x, gFittedSelectionRect.y, gFittedSelectionRect.width, gFittedSelectionRect.height);
    gCanvasContext.putImageData(previewData, 0, 0);

};


gSubstractButton.addEventListener('click', function() {


})

init();
