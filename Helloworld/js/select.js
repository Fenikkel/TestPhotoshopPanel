var gSelect = document.getElementById("layerSelect");
var gSelect2 = document.getElementById("layerSelect2");

var csInterface = new CSInterface();
var gAvaliableArtLayers;

// Hacer una lista de objetos con las imagenes de los layers que tenga los mismos indices que los nombres de estos layers que podremos en el select
var gLayersArray = [];
//console.log(gLayersArray.length);

//TEMPORAL
var gImageObject = { //rectangulo que respeta el aspect ratio de la imagen pero que no supera en ancho el canvas
    nombre: "Icon",
    src: "img/VRHockeyIcon.png",
    width: 0,
    height: 0
};
var gImageObject2 = { //rectangulo que respeta el aspect ratio de la imagen pero que no supera en ancho el canvas
    nombre: "Hockey",
    src: "img/table.png",
    width: 0,
    height: 0
};
var gImageObject3 = { //rectangulo que respeta el aspect ratio de la imagen pero que no supera en ancho el canvas
    nombre: "Frame",
    src: "img/frame.png",
    width: 0,
    height: 0
};

console.log("Initial index: " + gSelect.selectedIndex);
console.log("Length: " + gSelect.options.length); //cuenta tambien la inicial
console.log("\n\n");

// When a new <option> is selected //https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedIndex




function init(){

    //csInterface.evalScript("readAllLayers()", fillLayersArray);
    fullLayersArray();

}

function fillLayersArray(in_result){
    gAvaliableArtLayers = in_result;
}

function fullLayersArray(){

    gLayersArray.push(gImageObject);
    gLayersArray.push(gImageObject2);
    gLayersArray.push(gImageObject3);
    //console.log(gLayersArray.length);
    //console.log(gLayersArray[0]);

    addOption(gLayersArray[0].nombre);
    addOption(gLayersArray[1].nombre);
    addOption(gLayersArray[2].nombre);

/*
  for (var i = 0; i < gAvaliableArtLayers.length; i++) {
      addOption(gAvaliableArtLayers[i].nombre);
  }
*/


}

function addOption(optionName){

    var option = document.createElement("option");
    option.text = optionName;
    var option2 = document.createElement("option");
    option2.text = optionName;
    gSelect.add(option);
    gSelect2.add(option2);

}

gSelect.addEventListener('change', function() {
    var index = gSelect.selectedIndex;
    console.log("Selected index: " + index);
    console.log("Name: " + gSelect[index].text);
    //csInterface.alertThis("Selected index: " + index + "Name: " + gSelect[index].text);
    if(index>0){

        drawImage(gLayersArray[index-1].src);

    }


    //cuando se seleciona una opcion vamos al nuestra lista de layers con el index-1 y pintamos ese layer al canvas. Luego desaturamos la imagen

})

gSelect2.addEventListener('change', function() {
    var index = gSelect2.selectedIndex;
    console.log("Selected index: " + index);
    console.log("Name: " + gSelect2[index].text);
    //csInterface.alertThis("Selected index: " + index + "Name: " + gSelect[index].text);
    if(index>0){

        drawImageSubstracter(gLayersArray[index-1].src); //draw es de canvasmanager.js

    }


    //cuando se seleciona una opcion vamos al nuestra lista de layers con el index-1 y pintamos ese layer al canvas. Luego desaturamos la imagen

})

init();
