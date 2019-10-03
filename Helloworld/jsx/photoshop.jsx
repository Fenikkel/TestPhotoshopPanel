
//todas las funciones seran propiedad de CSInterface?

function sayHello(){ // esta funcion sera llamada desde CSInterface que hara de mediador entre el boton del panel (tu) y las caracteristicas de CEP (photoshop)
  alert("Hello from ExtendScript");
}

function alertThis( var_string ){ // esta funcion sera llamada desde CSInterface que hara de mediador entre el boton del panel (tu) y las caracteristicas de CEP (photoshop)
  alert(var_string);
}


function readAllLayers ()
{
	var retVal = new Array();
  //var docReference = app.activeDocument;


  for (var i = 0; i < app.activeDocument.artLayers.length; i++) { //pilla todas las capas que hay (menos los grupos[layerSets] y las capas dentro de los grupos)
   //alert(app.activeDocument.artLayers[i].name);
    if(app.activeDocument.artLayers[i].kind == LayerKind.NORMAL){
      //alert(app.activeDocument.artLayers[i].name);
      //AGAFAR I FER UNA ESTRUCTURA DE DATOS QUE TINGA EL NOM I COM APLEGAR A ELL (INDEX)
      var layer = {
        name: app.activeDocument.artLayers[i].name,
        index: i
      };
      retVal.push(layer);
    }
  }

	return retVal;
}
