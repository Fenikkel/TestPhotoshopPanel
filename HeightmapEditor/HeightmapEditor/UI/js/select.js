var gSelect = document.getElementById("layerSelect");
var gSelect2 = document.getElementById("layerSelect2");
var gIndexBase = 0;
var gIndexSubstracter = 1;


var csInterface = new CSInterface();
var gAvaliableArtLayers;

var gLayersArray = [];

// When a new <option> is selected //https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedIndex

function init(){

  csInterface.evalScript("readAllLayers()", fillLayersArray); //LI COSTA FER readAllLayers i tarda en fer fill layers array, per aixo tot el que fiquem despres segurament se executara abans de filllayers array

}

function fillLayersArray(in_result){

    eval("gAvaliableArtLayers = " + in_result); //el primero es el length de nuestra array (contando ese contador)

    if(gAvaliableArtLayers[0] == 1){
      alert("The project don\'t have layers");
    }

    for (var i = 1; i < gAvaliableArtLayers[0]; i++) {
        addOption(gAvaliableArtLayers[i].name);
    }

    initSelectors();

}
function initSelectors(){

  //recuerda que el primer elemento de  gAvaliableArtLayers es el length

  setBasePrevName(gAvaliableArtLayers[gIndexBase + 1].name);

  var str = "makePreviewBase( \"" +  gAvaliableArtLayers[gIndexBase + 1].name + "\""   + "\,"   +    "\""  + gAvaliableArtLayers[gIndexBase + 1].index  +"\")"; //LA COSA ES QUE TIENES QUe pasar una sola string a evalScript, que esta contenga la funcion con sus variables (que han de ser strings tambien sin ser variables (osea que tenga sus comillas) y ademas has de separarlo por una coma)

  csInterface.evalScript(str, paintBaseCanvas);

  setSubstracterPrevName(gAvaliableArtLayers[gIndexSubstracter + 1].name);

  var str2 = "makePreviewBase( \"" +  gAvaliableArtLayers[gIndexSubstracter +1].name + "\""   + "\,"   +    "\""  + gAvaliableArtLayers[gIndexSubstracter+1].index  +"\")";

  csInterface.evalScript(str2, paintSubstracterCanvas);
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

    if( (index - 1) < 0){
      return;
    }
    gIndexBase = index - 1; //asi tenemos el index real de art layers

    setBasePrevName(gAvaliableArtLayers[index].name);

    var str = "makePreviewBase( \"" +  gAvaliableArtLayers[index].name + "\""   + "\,"   +    "\""  + gAvaliableArtLayers[index].index  +"\")"; //LA COSA ES QUE TIENES QUe pasar una sola string a evalScript, que esta contenga la funcion con sus variables (que han de ser strings tambien sin ser variables (osea que tenga sus comillas) y ademas has de separarlo por una coma)

    csInterface.evalScript(str, paintBaseCanvas);

})


gSelect2.addEventListener('change', function() {
  var index = gSelect2.selectedIndex;

  if( (index - 1) < 0){
    return;
  }

  gIndexSubstracter = index - 1;


  setSubstracterPrevName(gAvaliableArtLayers[index].name);

  var str = "makePreviewBase( \"" +  gAvaliableArtLayers[index].name + "\""   + "\,"   +    "\""  + gAvaliableArtLayers[index].index  +"\")"; //LA COSA ES QUE TIENES QUe pasar una sola string a evalScript, que esta contenga la funcion con sus variables (que han de ser strings tambien sin ser variables (osea que tenga sus comillas) y ademas has de separarlo por una coma)

  csInterface.evalScript(str, paintSubstracterCanvas);


})

init();
