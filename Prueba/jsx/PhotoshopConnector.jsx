//var allLayers = app.activeDocument.layerSets.add();
//alert(allLayers.name);

/*for (var i = 0; i < app.documents.length; i++) { //imprime todos los proyectos activos
 alert(app.documents[i]);
}*/

/*
for (var i = 0; i < app.activeDocument.layers.length; i++) { //pilla todas las capas y grupos que hay pero no las capas y los grupos que hay dentro de grupos)
 alert(app.activeDocument.layers[i]);
}*/

/*for (var i = 0; i < app.activeDocument.artLayers.length; i++) { //pilla todas las capas que hay (menos los grupos[layerSets] y las capas dentro de los grupos)
 alert(app.activeDocument.artLayers[i].kind);
}*/


/*

for (var i = 0; i < app.activeDocument.layerSets.length; i++) { //pilla todas los layerSets(carpetas que hay pero no las que estan dentro de estas)
 alert(app.activeDocument.layerSets[i].name);
}
*/

#target photoshop


function makePreviewBase(prevName, indx){
	try {
		var xLib = new ExternalObject("lib:\PlugPlugExternalObject");
		//alert(prevName);
		//alert(indx);


		generatePreview(prevName, indx); // DESCOMENTAR


		//paintBaseCanvas();

	} catch(e) {
		alert(e.line + " - " + e);
	}
}

function generatePreview(prevName, indx){
	//alert(prevName);

	if (app.documents.length == 0) { //Si no hi ha res obert...
		return;
	}
	var selectedLayers = getSelectedLayers()
	if (selectedLayers.length == 0) { //si no hi ha capes selec
		alert("No layers selected.");
		return;
	} else if (selectedLayers.length > 1) { // si hi ha mes de una
		alert("Too many layers selected.");
		return;
	}

	/*var strlay ="";

	for (var i = 0; i < app.activeDocument.artLayers.length; i++) { //pilla todas las capas que hay (menos los grupos[layerSets] y las capas dentro de los grupos)

		strlay += " " + "Nombre" + app.activeDocument.artLayers[i].name + " indice: "+ i +"\n"


  }

	alert(indx);
	*/
	var activeLayer = activeDocument.activeLayer; //guardamos el active layer actual para al final retaurar este como active layer
	activeDocument.activeLayer = activeDocument.artLayers[indx]; //hacemos que el seleccionado sea active layer para proceder a toda la mandanga
	var previewInfoObj = createPreviews(activeDocument,hasLayerMaskSelected(), prevName); //miramos si tiene una layermask (seleccion?) y creamos los png en funcion
	if (previewInfoObj.url == "") {
		alert("failed to create the preview");
		return;
	}
	// save preview info in special place where UI can read it later
	//var envstr = 'com.adobe.SimpleDissolve.'+prevName
	$.setenv('com.adobe.SimpleDissolve.' + prevName, previewInfoObj.toSource()); //MODIFICADO
	activeDocument.activeLayer = activeLayer; //volvemos a poner el active layer que teniamos

}


function createPreviews(in_doc,in_isLayerMaskSelected, prevName) {
		//alert(prevName);

		blockRefresh(); // fa coses rares
		var hasSelection = false;
		var rulerUnits = app.preferences.rulerUnits;
		if (app.preferences.rulerUnits != Units.PIXELS) { // posem a pixels la medida
			app.preferences.rulerUnits = Units.PIXELS;
		}
		var retVal =
		{
			url: "", resolution:in_doc.resolution, width:in_doc.width.value, height:in_doc.height.value,
			selection: {url: "", resolution:0, rect:{x:0, y:0, width:0, height:0}}
		}
		var totalSteps = 10; // for progress bar

		// doProgress() uses heuristics that keep it from showing unnecessarily (for example, during very short tasks).
		// in this case most of time will consume saveToPNG on the end so we use doForcedProgress to disable heuristics
		// Other progress APIs must be called periodically to update the progress bar and allow canceling.
		// app.doProgress returns nothing so we use variable in parent scope
		app.doForcedProgress("Preparing Preview...",'subTask()');
		function subTask(){
			try { //intentamos hacer png de la seleccion
				if(!app.updateProgress(1,totalSteps)){return false;}
				var visibleLayers = hideLayers(in_doc) // amaguem les capes i tornem una llista de estes
				var selectBounds = in_doc.selection.bounds //in_doc es el active document  //the bounding rectangle of the entire selection
				retVal.selection.rect.x = selectBounds[0].value
				retVal.selection.rect.y = selectBounds[1].value
				if(!app.updateProgress(2,totalSteps)){return false;}
				in_doc.selection.makeWorkPath(0.5); //makes this selection item the work path for this document (el parametro es la tolerancia)
				copy() //hace un copy con executeaction (creo que copia lo que hay en la seleccion...)
				if(!app.updateProgress(3,totalSteps)){return false;}
				var selectionDoc = app.documents.add( //hace un documento(proyecto) nuevo
							selectBounds[2] - selectBounds[0], //ancho - x
							selectBounds[3] - selectBounds[1], //alto - y
							in_doc.resolution, //resolucion (resolucion del documento activo)
							"selection", //nombre
							NewDocumentMode.RGB, //modo
							DocumentFill.WHITE ); //initial fill
				retVal.selection.resolution = selectionDoc.resolution;
				retVal.selection.rect.width = selectionDoc.width.value;
				retVal.selection.rect.height = selectionDoc.height.value;
				if(!app.updateProgress(4,totalSteps)){return false;}
				if (selectionDoc.artLayers[0].isBackgroundLayer) { //hacemos que no sea background layer la capa de la seleccion
						selectionDoc.artLayers[0].isBackgroundLayer = false;
				}
				paste() //hace pegado (a la capa activa del cdocumento activo supongo)
				var selectionFile = File(Folder.temp+"/"+prevName+".png"); //hacemos el path de temp para la seleccion
				saveToPNG(selectionDoc, selectionFile); //guardamos la seleccion en formato PNG a temp
				if (selectionFile.exists) { //si se ha creado el archivo (si existe seleccion)
					retVal.selection.url = getURL(selectionFile); //guardamos el url de la seleccion
				}
				// yes we skipped some steps because export image takes longer
				if(!app.updateProgress(6,totalSteps)){return false;}
				selectionDoc.close(SaveOptions.DONOTSAVECHANGES); //cerramos el proyecto(documento) que hemos creado para la seleccion
				var pathItems = in_doc.pathItems["Work Path"]; //the path items collection (pillamos el work path) //devuelve un subPathItem (PatheItem)
				if(!app.updateProgress(7,totalSteps)){return false;}
				if (! in_isLayerMaskSelected) { //Si no tiene layer mask
					pathItems.makeSelection(); //Makes a Selection object whose border is this path (osea, que nos ha hecho una seleccion del active layer?)
					pathItems.remove(); //deletes this object
				}
				hasSelection = true
			}
			catch(e) {
				if(!app.updateProgress(7,totalSteps)){return false;}
			}
			var previewFile = File(Folder.temp+"/"+prevName+".png");
			if (in_isLayerMaskSelected) { //si tiene layer mask
				saveLayerMaskToPNG(in_doc,previewFile)
				if (hasSelection) { //si tiene seleccion
					pathItems.makeSelection(); //Makes a Selection object whose border is this path (osea, que nos ha hecho una seleccion del active layer?)
					pathItems.remove();
				}
				retVal.isMask = 1
			} else { //si no tiene layer mask...
				saveToPNG(in_doc, previewFile);
				retVal.isMask = 0;
			}
			if (previewFile.exists) {
					retVal.url =  getURL(previewFile)
			}
			if(!app.updateProgress(8,totalSteps)){return false;}
			reinstateLayersVisibility(in_doc,visibleLayers) //ponemos las capas visibles otra vez
		}
	if (app.preferences.rulerUnits != rulerUnits) { //volvemos a poner las unidades anteriores
		app.preferences.rulerUnits = rulerUnits
	}
	return retVal
}

function getURL(in_file) {
	if ($.os.match(/^mac/gi) != null) {
		var retVal = "file://" + in_file.absoluteURI;
	} else {
		var retVal = "file:///" + in_file.fsName.replace(/\\/g,"/");
	}
	return retVal
}

function paste() {
	var idpast = charIDToTypeID( "past" );
	executeAction( idpast, undefined, DialogModes.NO );
}

/*********************************/

function copy() {
	var idcopy = charIDToTypeID( "copy" );
	executeAction( idcopy, undefined, DialogModes.NO );
}
/*********************************/

function saveLayerMaskToPNG(in_doc,in_pngFile){
		showMaskChannel(true)
		var hiddenChannels = getHiddenChannels(in_doc)
		hideAllChannels(in_doc);
		maskChannelToDocument();
		saveToPNG(activeDocument,in_pngFile);
		activeDocument.close(SaveOptions.DONOTSAVECHANGES);
		reinstateHiddenChannels(hiddenChannels);
		showMaskChannel(false);
}

/*********************************/

function maskChannelToDocument() {
	// Copies the Layer Mask channel into a new document
	var idMk = charIDToTypeID( "Mk  " );
			var desc74 = new ActionDescriptor();
			var idNw = charIDToTypeID( "Nw  " );
					var desc75 = new ActionDescriptor();
					var idNm = charIDToTypeID( "Nm  " );
					desc75.putString( idNm, "preview" );
			var idDcmn = charIDToTypeID( "Dcmn" );
			desc74.putObject( idNw, idDcmn, desc75 );
			var idUsng = charIDToTypeID( "Usng" );
					var ref67 = new ActionReference();
					var idChnl = charIDToTypeID( "Chnl" );
					var idOrdn = charIDToTypeID( "Ordn" );
					var idTrgt = charIDToTypeID( "Trgt" );
					ref67.putEnumerated( idChnl, idOrdn, idTrgt );
			desc74.putReference( idUsng, ref67 );
	executeAction( idMk, desc74, DialogModes.NO );
	// Converts the document to Grayscale
	var idCnvM = charIDToTypeID( "CnvM" );
			var desc76 = new ActionDescriptor();
			var idT = charIDToTypeID( "T   " );
			var idGrys = charIDToTypeID( "Grys" );
			desc76.putClass( idT, idGrys );
	executeAction( idCnvM, desc76, DialogModes.NO );
}

/*********************************/

function hideAllChannels(in_doc) {
	for (var idx = 0; idx < in_doc.channels.length; idx++) {
		in_doc.channels[idx].visible = false
	}
}

/*********************************/

function getHiddenChannels(in_doc) {
	retVal = []
	for (var idx = 0; idx < in_doc.channels.length; idx++) {
		var channel = in_doc.channels[idx];
		if (! channel.visible) {
			retVal.push(channel);
		}
	}
	return retVal
}

/*********************************/

function reinstateHiddenChannels(in_channels) {
	if (in_channels) {
		for (var idx = 0; idx < in_channels.length; idx++) {
			in_channels[idx].visible = false;
		}
	}
}

/*********************************/

function showMaskChannel(in_show) {
	var idShw = charIDToTypeID( (in_show ? "Shw " : "Hd  "));
    var desc90 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var list12 = new ActionList();
            var ref82 = new ActionReference();
            var idChnl = charIDToTypeID( "Chnl" );
            var idChnl = charIDToTypeID( "Chnl" );
            var idMsk = charIDToTypeID( "Msk " );
            ref82.putEnumerated( idChnl, idChnl, idMsk );
        list12.putReference( ref82 );
    desc90.putList( idnull, list12 );
executeAction( idShw, desc90, DialogModes.NO );
}

/*********************************/

function saveToPNG(in_doc,in_pngFile){
	if (in_pngFile.exists) {
			in_pngFile.remove()
	}
	// SaveForWeb fails consistently on Windows.
	pngSaveOptions = new PNGSaveOptions()
	in_doc.saveAs(in_pngFile,pngSaveOptions,true,Extension.LOWERCASE);
}

/*********************************/

function hideLayers(in_doc) {
	var retVal = [];
	for (var idx = 0; idx < in_doc.artLayers.length; idx++) {
		var artLayer = in_doc.artLayers[idx]
		if (in_doc.activeLayer != artLayer && artLayer.visible) {
			artLayer.visible = false;
			retVal.push(artLayer);
		}
	}
	return retVal;
}

/*********************************/

function reinstateLayersVisibility(in_doc,in_layers) {
	if (in_layers) {
		for (var idx = 0; idx < in_layers.length; idx++) {
			try {
				var artLayer = in_layers[idx];
				artLayer.visible = true
			} catch(e) {}
		}
	}
}

/*********************************/

function getSelectedLayers() {
	var retVal = [];
	try {
		var backGroundCounter = activeDocument.layers[activeDocument.layers.length-1].isBackgroundLayer ? 1 : 0;
		var ref = new ActionReference();
		var keyTargetLayers = app.stringIDToTypeID( 'targetLayers' );
		ref.putProperty( app.charIDToTypeID( 'Prpr' ), keyTargetLayers );
		ref.putEnumerated( app.charIDToTypeID( 'Dcmn' ), app.charIDToTypeID( 'Ordn' ), app.charIDToTypeID( 'Trgt' ) );
		var desc = executeActionGet( ref );
		if ( desc.hasKey( keyTargetLayers ) ) {
			var layersList = desc.getList( keyTargetLayers );
			for ( var i = 0; i < layersList.count; i++) {
				var listRef = layersList.getReference( i );
				retVal.push( listRef.getIndex() + backGroundCounter );
			}
		}
	} catch(e) {

	}
	return retVal;
}

/*********************************/

function hasLayerMaskSelected() {
	var retVal = false;
	try {
		var ref = new ActionReference();
		var keyUserMaskEnabled = app.charIDToTypeID( 'UsrM' );
		ref.putProperty( app.charIDToTypeID( 'Prpr' ), keyUserMaskEnabled );
		ref.putEnumerated( app.charIDToTypeID( 'Lyr ' ), app.charIDToTypeID( 'Ordn' ), app.charIDToTypeID( 'Trgt' ) );
		var desc = executeActionGet( ref );
		retVal = desc.hasKey( keyUserMaskEnabled );
	}catch(e) {
		retVal = false;
	}
	if (retVal) {
		try {
			retVal = ! (activeDocument.activeChannels.length > 0)
		}
		catch(e) {
			retVal = true
		}
	}
	return retVal;
}

/*********************************/

function blockRefresh(){
	var idsetd = charIDToTypeID( "setd" );
	var desc = new ActionDescriptor();
	var idnull = charIDToTypeID( "null" );
	var ref = new ActionReference();
	var idPrpr = charIDToTypeID( "Prpr" );
	var idPbkO = charIDToTypeID( "PbkO" );
	ref.putProperty( idPrpr, idPbkO );
	var idcapp = charIDToTypeID( "capp" );
	var idOrdn = charIDToTypeID( "Ordn" );
	var idTrgt = charIDToTypeID( "Trgt" );
	ref.putEnumerated( idcapp, idOrdn, idTrgt );
	desc.putReference( idnull, ref );
	var idT = charIDToTypeID( "T   " );
	var desc2 = new ActionDescriptor();
	var idperformance = stringIDToTypeID( "performance" );
	var idaccelerated = stringIDToTypeID( "accelerated" );
	desc2.putEnumerated( idperformance, idperformance, idaccelerated );
	var idPbkO = charIDToTypeID( "PbkO" );
	desc.putObject( idT, idPbkO, desc2 );
	executeAction( idsetd, desc, DialogModes.NO );
}

function generateTemp(){
	var initialPrefs = app.preferences.rulerUnits;
	app.preferences.rulerUnits = Units.PIXELS;
	//var dir = app.activeDocument.path;
	//var dir ="~/Documents";
	//var dir ="~/Temp"; //Nope
	//var dir ="~/tmp"; //Nope
	var dir ="~/AppData/Local/Temp";
	//alert(dir);

	//Make a copy


	app.activeDocument.artLayers[0].copy(false);
	//alert(app.activeDocument.mode);
	//var docCopy = app.documents.add(app.activeDocument.width, app.activeDocument.height, app.activeDocument.resolution , "DocumentTemporal");//, app.activeDocument.mode, DocumentFill.TRANSPARENT, app.activeDocument.pixelAspectRatio, app.activeDocument.bitsPerChannel, app.activeDocument.colorProfileName);
	var docCopy = app.activeDocument.duplicate();
	var tope = app.activeDocument.layers.length;
	for (var i = 0; i < tope; i++) {
		if(i == tope-1){
			app.activeDocument.activeLayer.clear();

		}
		else{
			app.activeDocument.activeLayer.remove();

		}
	}
	//app.activeDocument.layers.removeAll();
	app.activeDocument.paste(false);

	//app.activeDocument.artLayers[0].desaturate();

	var origwidth = docCopy.width.value;
	var origHeight = docCopy.height.value;

//hacemos las opciones de guardado
	var sfw  = new ExportOptionsSaveForWeb();
	sfw.format = SaveDocumentType.PNG;
	sfw.PNG8 = false; //use PNG-24
	sfw.transparency = true;

	var destFolder = dir;
	//var destFolder = Folder(dir).selectDlg("Selecto folder");

	var iconName = "nombreTemporal.png";

	try{
		docCopy.exportDocument(new File(destFolder + "/" + iconName), ExportType.SAVEFORWEB, sfw);
	}
	catch(exception){
		alert("ERROR: " + exception);
	}
	finally{ //esto se hace hay error o no
		app.preferences.rulerUnits = initialPrefs;

		if(docCopy != null){
				docCopy.close(SaveOptions.DONOTSAVECHANGES);
		}
	}

}



function sayHello(){ // esta funcion sera llamada desde CSInterface que hara de mediador entre el boton del panel (tu) y las caracteristicas de CEP (photoshop)
  alert("Hello from ExtendScript");
}

function alertThis( var_string ){ // esta funcion sera llamada desde CSInterface que hara de mediador entre el boton del panel (tu) y las caracteristicas de CEP (photoshop)
  alert(var_string);
}

function readPreviewInfo ()
{
	//var retVal = $.getenv('com.fenikkel.Substract.previewBase'); //te da un string con toda la info...? no el objeto clase

	var retVal = $.getenv('com.adobe.SimpleDissolve.previewBase'); //te da un string con toda la info...? no el objeto clase
	//alert(retVal);
	return retVal;
}


function readAllLayers ()
{
	var retVal = [];
  //var docReference = app.activeDocument;
	var contador = 1;

	retVal[0] = contador;


	//SI HI HA TEXT SE BUGGEJA!!! (tot lo que estiga baix de ell sen va a la merda) //https://www.adobe.com/content/dam/acom/en/devnet/photoshop/pdfs/photoshop-cc-javascript-ref-2019.pdf
  for (var i = 0; i < app.activeDocument.artLayers.length; i++) { //pilla todas las capas que hay (menos los grupos[layerSets] y las capas dentro de los grupos)
   //alert(app.activeDocument.artLayers[i].name);
    if(app.activeDocument.artLayers[i].kind == LayerKind.NORMAL){
			//alert(app.activeDocument.artLayers[i].name);

			indice= i;
			contador++;

      var layer = {
        name: app.activeDocument.artLayers[i].name,
        index: i
      };
			retVal[i+1] = layer;

    }
  }

	retVal[0] = contador; //asi tendremos el length del array de objetos

	return retVal.toSource();
}
