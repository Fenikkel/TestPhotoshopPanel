var gSelect = document.getElementById("layerSelect");
var gSelect2 = document.getElementById("layerSelect2");

var csInterface = new CSInterface();
var gAvaliableArtLayers;

// Hacer una lista de objetos con las imagenes de los layers que tenga los mismos indices que los nombres de estos layers que podremos en el select
var gLayersArray = [];
//console.log(gLayersArray.length);

// When a new <option> is selected //https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedIndex

function init(){

    csInterface.evalScript("readAllLayers()", fillLayersArray);


    //LI COSTA FER readAllLayers i tarda en fer fill layers array, per aixo tot el que fiquem despres segurament se executara abans de filllayers array
    /*setTimeout(function(){
      csInterface.evalScript('alertThis(' + gAvaliableArtLayers + ')');

    }, 10000);*/




}

function fillLayersArray(in_result){

    eval("gAvaliableArtLayers = " + in_result); //el primero es el length de nuestra array (contando ese contador)


    if(gAvaliableArtLayers[0] == 1){
      alert("The project don\'t have layers");
        //csInterface.evalScript('alertThis(\"The project don\'t have layers\")');
    }

    for (var i = 1; i < gAvaliableArtLayers[0]; i++) {
        addOption(gAvaliableArtLayers[i].name);
    }

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

    if(index - 1 < 0){
      return;
    }
    alert("Selected index: " + index + "\n" +
    "NameSel: " + gSelect[index].text + "\n" +
    "NameLayer: " + gAvaliableArtLayers[index].name + "\n" +
    "indxLayer: " + gAvaliableArtLayers[index].index);


    //alert("NameSel: " + gSelect[index].text);
    //alert("NameLayer: " + gAvaliableArtLayers[index].name);


    var str = "makePreviewBase( \"" + "prevB" + "\""   + "\,"   +    "\""  + index  +"\")"; //LA COSA ES QUE TIENES QUe pasar una sola string a evalScript, que esta contenga la funcion con sus variables (que han de ser strings tambien sin ser variables (osea que tenga sus comillas) y ademas has de separarlo por una coma)
    csInterface.evalScript(str);

    //cuando se seleciona una opcion vamos al nuestra lista de layers con el index-1 y pintamos ese layer al canvas. Luego desaturamos la imagen

})

/*
gSelect2.addEventListener('change', function() {
    var index = gSelect2.selectedIndex;
    console.log("Selected index: " + index);
    console.log("Name: " + gSelect2[index].text);
    csInterface.alertThis("Selected index: " + index + "Name: " + gSelect[index].text);



    //cuando se seleciona una opcion vamos al nuestra lista de layers con el index-1 y pintamos ese layer al canvas. Luego desaturamos la imagen

})*/

init(); //DESCOMENTAR
