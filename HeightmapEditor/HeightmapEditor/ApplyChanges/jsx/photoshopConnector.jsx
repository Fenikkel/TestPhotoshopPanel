#target photoshop

var gApplySuccessful = false

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


// Get the heightmap.png and apply it to layer
//------------------------------------------------------------------------------

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
			var hiddenChannels = getHiddenChannels(doc);
			var heightFile = File(Folder.temp + "/heightmap.png");
			if (!heightFile.exists) {
				alert("Cannot find file: " + heightFile.fsName);
				return;
			}
			var heightDoc = app.open(heightFile);
			if (!app.updateProgress(4, totalSteps)) {
				return false;
			}
			heightDoc.selection.selectAll();
			heightDoc.selection.copy(true);
			if (!app.updateProgress(5, totalSteps)) {
				return false;
			}
			heightDoc.close(SaveOptions.DONOTSAVECHANGES);
			app.activeDocument = doc;
			if (!app.updateProgress(6, totalSteps)) {
				return false;
			}
			var hasSelection = false;
			/*if (in_isLayerMask) {
				showMaskChannel(true);
				hideLayers(doc);
			}*/
			try {
				makeWorkPath();
				var pathItems = doc.pathItems["Work Path"];
				pathItems.makeSelection();
				if (doc.activeLayer.allLocked) {
					doc.activeLayer.allLocked = false;
				}
				doc.paste(true);
				hasSelection = true;
			} catch (e) {
				doc.paste();
			}
			if (!app.updateProgress(8, totalSteps)) {
				return false;
			}
			// Merge down layer
			var idMrgtwo = charIDToTypeID("Mrg2");
			var desc163 = new ActionDescriptor();
			executeAction(idMrgtwo, desc163, DialogModes.NO);
			if (!app.updateProgress(9, totalSteps)) {
				return false;
			}
			if (hasSelection) {
				pathItems.makeSelection();
			}
			gApplySuccessful = true;

			reinstateHiddenChannels(hiddenChannels);

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
