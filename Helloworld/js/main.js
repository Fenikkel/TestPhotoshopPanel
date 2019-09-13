(function () {
 'use strict';

 var csInterface = new CSInterface(); //crea una instancia de CSInterface

 var context = $('#cnvsPreview')[0].getContext("2d"); // esto podemos hacerlo (el $) gracias a la libreria jQuery (jquery-2.0.2.min.js)

 var previewData = new Image();

 //previewData.src = "img/VRHockeyIcon.png"; //SI
 //previewData.src = "\\img\\VRHockeyIcon.png"; //NO
 //previewData.src = "\img\VRHockeyIcon.png"; //NO

 //https://developer.mozilla.org/es/docs/Web/API/HTMLImageElement



 //console.log("width: " + prevWidth);
 //console.log("height: " + prevHeight);



 function drawPreview() {

    context.fillStyle = "#FFFF00";
    context.fillRect(0,0,30,40);
    //Con imagen ya puesta // https://www.w3schools.com/tags/tryit.asp?filename=tryhtml5_canvas_drawimage
    //Con url de la carpeta de la imagen // http://www.williammalone.com/briefs/how-to-draw-image-html5-canvas/

    previewData.onload = function () { //Se hace esta funcion cuando se carga la imagen/objeto  // https://www.w3schools.com/jsref/event_onload.asp
    context.drawImage(previewData, 10, 10); //context.drawImage(img,x,y,width,height);
    };
    previewData.src = 'img/VRHockeyIcon.png';
    var prevWidth = previewData.naturalWidth;
    var prevHeight = previewData.naturalHeight;

    var cnvsHeight = $('#cnvsPreview').height(); //Selector -> https://stackoverflow.com/questions/2167544/what-does-the-function-do-in-javascript/2167561#2167561 --> funcion de jQuery
		var cnvsWidth = $('#cnvsPreview').width();

    console.log(previewData.src);
    console.log(previewData.width);
    console.log(previewData.height);
    console.log("width: " + prevWidth); //cuando la imagen esta en el htm todo correcto, pero sino nos da 0 de tamaño
    console.log("height: " + prevHeight);
    console.log("cnvwidth: " + cnvsWidth);
    console.log("height: " + cnvsHeight);

}


function rescale(in_rect, in_img) {
  var retVal = in_img;
  if (in_img.width > in_rect.width || in_img.height > in_rect.height) { //si la imagen del preview es mayor que el canvas...
    var rectRatio = in_rect.height / in_rect.width;
    var imgRation = in_img.height / in_img.width;
    if (rectRatio > imgRation) {  //si el canvas es mas alto en cuanto aspect ratio(altura/ancho) que la imagen preview...
      var ratio = (in_rect.width / in_img.width);
    } else {
      var ratio = (in_rect.height / in_img.height);
    }
    retVal.width = Math.floor(retVal.width * ratio);
    retVal.height = Math.floor(retVal.height * ratio);
  }
  return retVal;
}



 document.getElementById('btn_test').addEventListener('click', function () { //le añade al boton un eventlistener...
   //con esta funcion a ejecutar
   csInterface.evalScript('sayHello()'); //  the csInterface.evalScript method is used to send to the Photoshop JSX engine the 'sayHello()' string for evaluation
   //realmente va al manifest y pregunta por el JSX que
 });

drawPreview();


}());
