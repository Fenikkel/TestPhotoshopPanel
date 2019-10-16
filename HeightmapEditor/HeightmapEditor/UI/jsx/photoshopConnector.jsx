#target photoshop

var gApplySuccessful = false

function makePreviewBase(prevName, indx){
	try {
		var xLib = new ExternalObject("lib:\PlugPlugExternalObject");

		generatePreview(prevName, indx);

	} catch(e) {
		alert(e.line + " - " + e);
	}
}

/**************************************************************************************************************************************************/

function generatePreview(prevName, indx){

	if (app.documents.length == 0) { //Si no hi ha res obert...
		return;
	}

	var activeLayer = activeDocument.activeLayer; //guardamos el active layer actual para al final retaurar este como active layer
	activeDocument.activeLayer = activeDocument.artLayers[indx]; //hacemos que el seleccionado sea active layer para proceder a toda la mandanga
	activeDocument.activeLayer.visible = true;
	var previewInfoObj = createPreviews(activeDocument,hasLayerMaskSelected(), prevName); //miramos si tiene una layermask (seleccion?) y creamos los png en funcion
	if (previewInfoObj.url == "") {
		alert("failed to create the preview");
		return;
	}
	// save preview info in special place where UI can read it later
	$.setenv('com.fenikkel.HeightmapEditor.' + prevName, previewInfoObj.toSource());
	activeDocument.activeLayer = activeLayer; //volvemos a poner el active layer que teniamos

}

/**************************************************************************************************************************************************/

function createPreviews(in_doc,in_isLayerMaskSelected, prevName) {

		blockRefresh();
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
				//https://gist.github.com/doctyper/992342

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

/**************************************************************************************************************************************************/

function getURL(in_file) {
	if ($.os.match(/^mac/gi) != null) {
		var retVal = "file://" + in_file.absoluteURI;
	} else {
		var retVal = "file:///" + in_file.fsName.replace(/\\/g,"/");
	}
	return retVal
}


/**************************************************************************************************************************************************/


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

/**************************************************************************************************************************************************/

function readPreviewInfo (prevStr)
{
	var retVal = $.getenv('com.fenikkel.HeightmapEditor.' + prevStr); //te da un string con toda la info de la imagen guardada en temp con ese nombre

	return retVal;
}

function readPreviewInfoTest ()
{
	var retVal = {numero: 1, string: "hola desde readPreviewInfoTest"}; //te da un string con toda la info de la imagen guardada en temp con ese nombre

	return retVal.toSource();
}

/**************************************************************************************************************************************************/

function readAllLayers ()
{
	var retVal = [];
	var contador = 1;

	retVal[0] = contador;

	//SI HI HA TEXT SE BUGGEJA!!! (tot lo que estiga baix de ell sen va a la merda) //https://www.adobe.com/content/dam/acom/en/devnet/photoshop/pdfs/photoshop-cc-javascript-ref-2019.pdf

  for (var i = 0; i < app.activeDocument.artLayers.length; i++) { //pilla todas las capas que hay (menos los grupos[layerSets] y las capas dentro de los grupos)

    if(app.activeDocument.artLayers[i].kind == LayerKind.NORMAL){

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


//Creates the png with the result that will be applied
// to the layer or selection
function storeHeightmapImage(in_contents) {
	var retVal = false
	var heightFile = File(Folder.temp + "/heightmap.png")
	if (heightFile.exists) {
		heightFile.remove();
	}
	heightFile.encoding = "BINARY";
	if (!heightFile.open('w')) {
		return retVal.toString();
	}
	heightFile.write(unescape(in_contents));
	heightFile.close();
	retVal = heightFile.exists;

	return retVal.toString();
}
//Don't leave trace of the operations executed by
// applyChangesFilter()
function applyChanges() {
	activeDocument.suspendHistory("Heightmap Editor", "applyChangesFilter()");
	return gApplySuccessful;
}


function applyChangesFilter() {
	var totalSteps = 10; // for progress bar
	app.doForcedProgress('Creating the heightmap...', 'subTask()');

	function subTask() {
		try {
			gApplySuccessful = false
			if (!app.updateProgress(2, totalSteps)) {
				return false;
			}
			var doc = app.activeDocument;
			var heightFile = File(Folder.temp + "/heightmap.png"); //tiene el substract hecho pero a escala del canvas
			if (!heightFile.exists) {
				alert("Cannot find file: " + heightFile.fsName);
				return;
			}
			var heightDoc = app.open(heightFile);
			if (!app.updateProgress(4, totalSteps)) {
				return false;
			}
			heightDoc.selection.selectAll();
			heightDoc.selection.copy(true); //copiamos en el documento nuevo toda la imagen
			if (!app.updateProgress(5, totalSteps)) {
				return false;
			}
			heightDoc.close(SaveOptions.DONOTSAVECHANGES);
			app.activeDocument = doc;

			var newLayer = activeDocument.artLayers.add();
			newLayer.name = "Heightmap texture"; //si tenen el mateix nom que?
			activeDocument.activeLayer = newLayer;

			alert("creado");

			if (!app.updateProgress(6, totalSteps)) {
				return false;
			}

			doc.paste();


			if (!app.updateProgress(8, totalSteps)) {
				return false;
			}

			alert("borrado");
			if (!app.updateProgress(9, totalSteps)) {
				return false;
			}

			gApplySuccessful = true;

		} catch (e) {
			alert("Line: " + e.line + " - " + e);
		}
	}
}

//------------------------------------------------------------------------------
// makeWorkPath - selection.makeWorkPath() does not seem to have the same effect.
//------------------------------------------------------------------------------

function makeWorkPath() {
	var idMk = charIDToTypeID("Mk  ");
	var desc92 = new ActionDescriptor();
	var idnull = charIDToTypeID("null");
	var ref34 = new ActionReference();
	var idPath = charIDToTypeID("Path");
	ref34.putClass(idPath);
	desc92.putReference(idnull, ref34);
	var idFrom = charIDToTypeID("From");
	var ref35 = new ActionReference();
	var idcsel = charIDToTypeID("csel");
	var idfsel = charIDToTypeID("fsel");
	ref35.putProperty(idcsel, idfsel);
	desc92.putReference(idFrom, ref35);
	var idTlrn = charIDToTypeID("Tlrn");
	var idPxl = charIDToTypeID("#Pxl");
	desc92.putUnitDouble(idTlrn, idPxl, 2);
	executeAction(idMk, desc92, DialogModes.NO);
}


function getHiddenChannels(in_doc) {
	retVal = []
	for (var idx = 0; idx < in_doc.channels.length; idx++) {
		var channel = in_doc.channels[idx];
		if (!channel.visible) {
			retVal.push(channel);
		}
	}
	return retVal
}


//------------------------------------------------------------------------------
// reinstateHiddenChannels - get the hidden channels into an array so they can be
// reinstate.
//------------------------------------------------------------------------------

function reinstateHiddenChannels(in_channels) {
	if (in_channels) {
		for (var idx = 0; idx < in_channels.length; idx++) {
			in_channels[idx].visible = false;
		}
	}
}

//------------------------------------------------------------------------------
// hideLayers - If we are dealing with a layer mask we need hide the layers
//------------------------------------------------------------------------------

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

//------------------------------------------------------------------------------
// blockRefresh - Main menu > Window > Actions > Flyout menu > Playback Options > Performance > Accelerated
// Because if someone set something else for his actions then it also applied for scripts
//------------------------------------------------------------------------------

function blockRefresh() {
	var idsetd = charIDToTypeID("setd");
	var desc = new ActionDescriptor();
	var idnull = charIDToTypeID("null");
	var ref = new ActionReference();
	var idPrpr = charIDToTypeID("Prpr");
	var idPbkO = charIDToTypeID("PbkO");
	ref.putProperty(idPrpr, idPbkO);
	var idcapp = charIDToTypeID("capp");
	var idOrdn = charIDToTypeID("Ordn");
	var idTrgt = charIDToTypeID("Trgt");
	ref.putEnumerated(idcapp, idOrdn, idTrgt);
	desc.putReference(idnull, ref);
	var idT = charIDToTypeID("T   ");
	var desc2 = new ActionDescriptor();
	var idperformance = stringIDToTypeID("performance");
	var idaccelerated = stringIDToTypeID("accelerated");
	desc2.putEnumerated(idperformance, idperformance, idaccelerated);
	var idPbkO = charIDToTypeID("PbkO");
	desc.putObject(idT, idPbkO, desc2);
	executeAction(idsetd, desc, DialogModes.NO);
}
