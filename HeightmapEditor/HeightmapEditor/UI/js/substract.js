var gSubstractButton = document.getElementById("btn_substract");


function drawSubstract(){
  var baseContext = $('#cnvsPreview')[0].getContext("2d");
  var substracterContext = $('#cnvsPreview2')[0].getContext("2d");
  var finalContext = $('#cnvsFinal')[0].getContext("2d");

  finalContext.fillStyle = "#000000";

  finalContext.fillRect(0, 0, $('#cnvsFinal').width(), ($('#cnvsFinal').height())); //relleno todo el canvas de amarillo

  var baseData = baseContext.getImageData(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height()));
  var substracterData = substracterContext.getImageData(0, 0, $('#cnvsPreview2').width(), ($('#cnvsPreview2').height()));
  var finalData = finalContext.getImageData(0, 0, $('#cnvsFinal').width(), ($('#cnvsFinal').height()));

  var baseX = 0;
  var baseY = 0;
  var substracterX = 0;
  var substracterY = 0;
  var finalX = 0;
  var finalY = 0;

  var dataIdx = 0;

  var red = 0;
  var green = 0;
  var blue = 0;
  var alpha = 0;

  while (dataIdx < baseData.data.length) { //baseData.data.length

      //CUIDADO CON LAS MASCARAS... (gPreviewInfo.isMask == '1' ? 69 : 0)

      red = baseData.data[dataIdx] - substracterData.data[dataIdx]; //Red
      green = baseData.data[dataIdx+1] - substracterData.data[dataIdx+1]; //Green
      blue = baseData.data[dataIdx+2] - substracterData.data[dataIdx+2]; //Blue
      //alpha =  baseData.data[dataIdx+3] - substracterData.data[dataIdx+3];

      if(baseData.data[dataIdx+3] > substracterData.data[dataIdx+3]){

        alpha = substracterData.data[dataIdx+3];

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

  finalContext.putImageData(finalData, 0, 0);

}

function drawDissolve(){
  var baseContext = $('#cnvsPreview')[0].getContext("2d");

//https://stackoverflow.com/questions/22097747/how-to-fix-getimagedata-error-the-canvas-has-been-tainted-by-cross-origin-data
  var baseData = baseContext.getImageData(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height())); // get image data te hace una copia de los limites que has seleccionado

  var dataIdx = 0;

  while (dataIdx < baseData.data.length) {

      dissolvePixel = doDissolvePixel();

      if(dissolvePixel){
        baseData.data[dataIdx] = 255; //Red
        baseData.data[dataIdx + 1] = 0; //Green
        baseData.data[dataIdx + 2] = 0; //Blue
      }

      dataIdx = dataIdx + 4; //pintamos de 4 pixeles en 4

  }

  baseContext.putImageData(baseData, 0, 0);
}

function doDissolvePixel() {
  var rand = Math.floor((Math.random() * 100) + 1); //valor del 1 al 101?
  return (rand <= parseFloat(4)); //si el valor random es menor que el porcentaje del panel devolvemos true
}


gSubstractButton.addEventListener('click', function() {

    drawSubstract();

})
