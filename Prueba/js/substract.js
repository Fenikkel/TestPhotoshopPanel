var gSubstractButton = document.getElementById("btn_substract");


function drawSubstract(){
  var baseContext = $('#cnvsPreview')[0].getContext("2d");
  var substracterContext = $('#cnvsPreview2')[0].getContext("2d");
  var finalContext = $('#cnvsFinal')[0].getContext("2d");

//https://stackoverflow.com/questions/22097747/how-to-fix-getimagedata-error-the-canvas-has-been-tainted-by-cross-origin-data
  var baseData = baseContext.getImageData(0, 0, $('#cnvsPreview').width(), ($('#cnvsPreview').height())); // get image data te hace una copia de los limites que has seleccionado
  var substracterData = substracterContext.getImageData(0, 0, $('#cnvsPreview2').width(), ($('#cnvsPreview2').height()));
  var finalData = finalContext.getImageData(0, 0, $('#cnvsFinal').width(), ($('#cnvsFinal').height()));

 // https://www.dropbox.com/developers/chooser#js

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


  while (dataIdx < baseData.data.length) { //CUIDADO CON OUT OF RANGE (los canvas han de ser del mismo tamaño)

      //CUIDADO CON LAS MASCARAS... (gPreviewInfo.isMask == '1' ? 69 : 0)

      finalData.data[dataIdx] = baseData.data[dataIdx] - substracterData.data[dataIdx]; //Red
      finalData.data[dataIdx+1] = baseData.data[dataIdx+1] - substracterData.data[dataIdx+1]; //Green
      finalData.data[dataIdx+2] = baseData.data[dataIdx+2] - substracterData.data[dataIdx+2]; //Blue

      //si dejo tranquila  la transparencia ira mas rapido
      finalData.data[dataIdx+3] = baseData.data[dataIdx+3] - substracterData.data[dataIdx+3]; //el canal alpha (transparencias) = totalmente opaco

      dataIdx = dataIdx + 4; //pintamos de 4 pixeles en 4

  }

  finalContext.putImageData(finalData, 0, 0);

}

gSubstractButton.addEventListener('click', function() {

    console.log("SUBSTRACT");
    drawSubstract();

})
