﻿/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2014 Adobe Inc.
* All Rights Reserved.
*
* NOTICE: Adobe permits you to use, modify, and distribute this file in
* accordance with the terms of the Adobe license agreement accompanying
* it. If you have received this file from a source other than Adobe,
* then your use, modification, or distribution of it requires the prior
* written permission of Adobe.
**************************************************************************/
//------------------------------------------------------------------------------
// readPreviewInfo
// previewInfo contains an object with the
//		height
//		width
// 		url of the preview
//		selection (if any).
//------------------------------------------------------------------------------







/*
// BEGIN__HARVEST_EXCEPTION_ZSTRING
<javascriptresource>
<name>Simple Dissolve Extension...</name>
<menu>filter</menu>
<eventid>6F17BFA7-EFC8-11EA-B850-7B95ED8EA713</eventid>
<enableinfo> in (PSHOP_ImageMode, RGBMode, CMYKMode, HSLMode, HSBMode, LabMode, RGB48Mode)  &amp;&amp; (PSHOP_IsTargetVisible  &amp;&amp;  ! PSHOP_IsTargetSection)</enableinfo>
<category>filter</category>
</javascriptresource>
// END__HARVEST_EXCEPTION_ZSTRING
*/



#target photoshop

/*********************************/

var gExitLoop = false

try {
	var xLib = new ExternalObject("lib:\PlugPlugExternalObject");
	displayExtensionDlg()
} catch(e) {
	alert(e.line + " - " + e);
}

/*********************************/

function displayExtensionDlg() {
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
	var activeLayer = activeDocument.activeLayer
	var previewInfoObj = createPreviews(activeDocument,hasLayerMaskSelected()) //miramos si tiene una layermask (seleccion?) y creamos los png en funcion
	if (previewInfoObj.url == "") {
		return;
	}
	// save preview info in special place where UI can read it later
	$.setenv('com.adobe.SimpleDissolve.preview',previewInfoObj.toSource());
	activeDocument.activeLayer = activeLayer;
	//loadDialog(); //DESCOMENTAR
}

/*********************************/

function loadDialog() { //como que hace un evento...
		var eventObj = new CSXSEvent();
		eventObj.type = "com.adobe.event.loadSimpleDissolve";
		eventObj.message = ""
		eventObj.dispatch()
}

/*********************************/

function createPreviews(in_doc,in_isLayerMaskSelected) {

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
				var selectionFile = File(Folder.temp+"/selection.png"); //hacemos el path de temp para la seleccion
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
			var previewFile = File(Folder.temp+"/preview.png");
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

/*********************************/

function getURL(in_file) {
	if ($.os.match(/^mac/gi) != null) {
		var retVal = "file://" + in_file.absoluteURI;
	} else {
		var retVal = "file:///" + in_file.fsName.replace(/\\/g,"/");
	}
	return retVal
}

/*********************************/

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


function readPreviewInfo ()
{
	var retVal = $.getenv('com.adobe.SimpleDissolve.preview'); //te da un string con toda la info...? no el objeto clase
	alert(retVal);

	return retVal;
}

function sayHello ()
{
	//alert("retVal");



	return;
}
