var gSubstractButton = document.getElementById("btn_substract");

 var gCanvasContext = $('#cnvsPreview')[0].getContext("2d"); // esto podemos hacerlo (el $) gracias a la libreria jQuery (jquery-2.0.2.min.js)
 var gCanvasContext2 = $('#cnvsPreview2')[0].getContext("2d"); // esto podemos hacerlo (el $) gracias a la libreria jQuery (jquery-2.0.2.min.js)

 var gImageData = new Image();

 var gImageDataSubstracter = new Image();

 var gWidthAspectRatio = 1; //aspect ratio
 var gFittedRectangle = { //rectangulo que respeta el aspect ratio de la imagen pero que no supera en ancho el canvas
   x: 0,
   y: 0,
   width: 0,
   height: 0
 };

 //previewData.src = "img/VRHockeyIcon.png"; //SI
 //previewData.src = "\\img\\VRHockeyIcon.png"; //NO
 //previewData.src = "\img\VRHockeyIcon.png"; //NO

 //https://developer.mozilla.org/es/docs/Web/API/HTMLImageElement

function init() {

  //gImageData.src = 'img/VRHockeyIcon.png';

  gCanvasContext.fillStyle = "#FFFF00";
  gCanvasContext2.fillStyle = "#00FFFF";

  gCanvasContext.fillRect(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height())); //relleno todo el canvas de amarillo
  gCanvasContext2.fillRect(0, 0, $('#cnvsPreview2').width(), ($('#cnvsPreview2').height())); //relleno todo el canvas de amarillo
}

function drawSubstract(){ //PUEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

  var baseContext = $('#cnvsPreview')[0].getContext("2d");
  var substracterContext = $('#cnvsPreview2')[0].getContext("2d");
  var finalContext = $('#cnvsFinal')[0].getContext("2d");

//https://stackoverflow.com/questions/22097747/how-to-fix-getimagedata-error-the-canvas-has-been-tainted-by-cross-origin-data
  var baseData = gCanvasContext.getImageData(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height())); // get image data te hace una copia de los limites que has seleccionado
  var substracterData = gCanvasContext2.getImageData(0, 0, $('#cnvsPreview2').width(), ($('#cnvsPreview2').height()));
  var finalData = finalContext.getImageData(0, 0, $('#cnvsFinal').width(), ($('#cnvsFinal').height()));

  //baseData.crossOrigin = "Anonymous";
  //substracterData.crossOrigin = "Anonymous";
  //finalData.crossOrigin = "Anonymous";
  var baseX = 0;
  var baseY = 0;
  var substracterX = 0;
  var substracterY = 0;
  var finalX = 0;
  var finalY = 0;

  var dataIdx = 0;


  while (dataIdx < gImageData.data.length) { //400){// //CUIDADO CON OUT OF RANGE (los canvas han de ser del mismo tamaño)

      //CUIDADO CON LAS MASCARAS... (gPreviewInfo.isMask == '1' ? 69 : 0)

      finalData.data[dataIdx] = gImageData.data[dataIdx] - gImageDataSubstracter.data[dataIdx]; //Red
      finalData.data[dataIdx+1] = baseData.data[dataIdx+1] - substracterData.data[dataIdx+1]; //Green
      finalData.data[dataIdx+2] = baseData.data[dataIdx+2] - substracterData.data[dataIdx+2]; //Blue

      //si dejo tranquila  la transparencia ira mas rapido
      finalData.data[dataIdx+3] = baseData.data[dataIdx+3] - substracterData.data[dataIdx+3]; //el canal alpha (transparencias) = totalmente opaco

      dataIdx = dataIdx + 4; //pintamos de 4 pixeles en 4

  }

  finalContext.putImageData(finalData, 0, 0);

}


function drawImage(imagePath) { //seria mejor otra variable con el nombre del canvas que queremos editar



    gCanvasContext.clearRect(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height()));
    gCanvasContext.fillStyle = "#00FABA";
    gCanvasContext.fillRect(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height()));
    //gImageData.src = 'img/VRHockeyIcon.png';
    gImageData.src = imagePath; //con esto se activara el onLoad
}

function drawImageSubstracter(imagePath) {



    gCanvasContext2.clearRect(0, 0, $('#cnvsPreview2').width(), ($('#cnvsPreview2').height()));
    gCanvasContext2.fillStyle = "#00FABA";
    gCanvasContext2.fillRect(0, 0, $('#cnvsPreview2').width(), ($('#cnvsPreview2').height()));
    //gImageData.src = 'img/VRHockeyIcon.png';
    gImageDataSubstracter.src = imagePath; //con esto se activara el onLoad
}



function calculateFittedRectangle(imageData, canvasPreviewID){

  var imageWidth = imageData.width;
  var imageHeight = imageData.height;
  /*console.log("width: " + imageWidth);
  console.log("height: " + gImageData.height);*/

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

/*
  console.log("cnvsheight: " + $('#cnvsPreview').height());
  console.log("cnvsWidth: " + $('#cnvsPreview').width());
  console.log("width: " + fittedSize.width);
  console.log("height: " + gFittedRectangle.height);
*/
  gFittedRectangle.x = Math.floor(($(canvasPreviewID).width() - gFittedRectangle.width) / 2); //decimos que empiece en una posicion en concreto para centrarlo en el canvas
  gFittedRectangle.y = Math.floor(($(canvasPreviewID).height() - gFittedRectangle.height) / 2);
/*
  console.log("y: " + gFittedRectangle.y);
  console.log("x: " + gFittedRectangle.x);

  console.log("y not rouded: " + ($('#cnvsPreview').height() - gFittedRectangle.height) );
*/
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

function debug(){
    console.log("y not rouded: " );
}

gImageData.onload = function () { //Se hace esta funcion cuando se carga la imagen/objeto (util porque sino muchos atributos no estan actualizados)  // https://www.w3schools.com/jsref/event_onload.asp

    calculateFittedRectangle(gImageData, '#cnvsPreview');

    //gImageData.crossOrigin = "Anonymous";

    gCanvasContext.fillStyle = "#FABA00";
    gCanvasContext.fillRect(gFittedRectangle.x, gFittedRectangle.y, gFittedRectangle.width, gFittedRectangle.height);
    gCanvasContext.drawImage(gImageData, gFittedRectangle.x, gFittedRectangle.y, gFittedRectangle.width, gFittedRectangle.height); //context.drawImage(img,x,y,width,height);
    /*
    console.log("SRC: " + gImageData.src);

    console.log("width: " + gImageData.width);
    console.log("height: " + gImageData.height);

    console.log("cnvsheight: " + $('#cnvsPreview').height());
    console.log("cnvsWidth: " + $('#cnvsPreview').width());

    console.log("y: " + gFittedRectangle.y);
    console.log("x: " + gFittedRectangle.x);

    console.log("y not rouded: " + ($('#cnvsPreview').height() - gFittedRectangle.height) );
    */
       //Con imagen ya puesta // https://www.w3schools.com/tags/tryit.asp?filename=tryhtml5_canvas_drawimage
    //Con url de la carpeta de la imagen // http://www.williammalone.com/briefs/how-to-draw-image-html5-canvas/
};

gImageDataSubstracter.onload = function () { //Se hace esta funcion cuando se carga la imagen/objeto (util porque sino muchos atributos no estan actualizados)  // https://www.w3schools.com/jsref/event_onload.asp

    calculateFittedRectangle(gImageDataSubstracter, '#cnvsPreview2');
    //gImageDataSubstracter.crossOrigin = "Anonymous";

    gCanvasContext2.fillStyle = "#FABA00";
    gCanvasContext2.fillRect(gFittedRectangle.x, gFittedRectangle.y, gFittedRectangle.width, gFittedRectangle.height);
    gCanvasContext2.drawImage(gImageDataSubstracter, gFittedRectangle.x, gFittedRectangle.y, gFittedRectangle.width, gFittedRectangle.height); //context.drawImage(img,x,y,width,height);
    /*
    console.log("SRC: " + gImageData.src);

    console.log("width: " + gImageData.width);
    console.log("height: " + gImageData.height);

    console.log("cnvsheight: " + $('#cnvsPreview').height());
    console.log("cnvsWidth: " + $('#cnvsPreview').width());

    console.log("y: " + gFittedRectangle.y);
    console.log("x: " + gFittedRectangle.x);

    console.log("y not rouded: " + ($('#cnvsPreview').height() - gFittedRectangle.height) );
    */
       //Con imagen ya puesta // https://www.w3schools.com/tags/tryit.asp?filename=tryhtml5_canvas_drawimage
    //Con url de la carpeta de la imagen // http://www.williammalone.com/briefs/how-to-draw-image-html5-canvas/
};

gSubstractButton.addEventListener('click', function() {

    console.log("SUBSTRACT");
    drawSubstract();

})

init();

//drawImage();
