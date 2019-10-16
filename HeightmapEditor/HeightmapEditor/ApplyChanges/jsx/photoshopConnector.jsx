#target photoshop


function createTmp(baseIdx, substracterIdx){ //baseIdx, substracterIdx
  //alert("llegado");
  //alert(baseIdx);
  //alert(substracterIdx);


  var mainDoc = app.activeDocument;
  //var tmpDoc = app.documents.add(mainDoc.width, mainDoc.height, mainDoc.resolution, "Heightmap Editor Document", NewDocumentMode.GRAYSCALE);
  //app.activeDocument = tmpDoc;

  //tmpDoc.artLayers.add();
  //tmpDoc.artLayers.add();
  app.activeDocument = mainDoc;
  mainDoc.activeLayer = mainDoc.artLayers[baseIdx];//ponemos a active layer la que queremos crear el data; (tenemos que estar en el propio documento)


  var baseInfoObj = createData(mainDoc, "baseData");
  //alert("baseInfoObj = " + baseInfoObj.toSource());
  if (baseInfoObj.url == "") {
    alert("baseInfoObj empty");
    //return;
  }


  mainDoc.activeLayer = mainDoc.artLayers[substracterIdx];

  var substracterInfoObj = createData(mainDoc, "substracterData");
  if (substracterInfoObj.url == "") {
    alert("substracterInfoObj empty");
    //return;
  }


  // save preview info in special place where UI can read it later
  try{
    $.setenv('com.fenikkel.HeightmapEditor.baseData', baseInfoObj.toSource());
    $.setenv('com.fenikkel.HeightmapEditor.substracterData',substracterInfoObj.toSource());
  }
  catch(e) {
    alert(e.line + " - " + e);
  }



  app.activeDocument = mainDoc;

}

function createData(in_doc, in_name){

    var rulerUnits = app.preferences.rulerUnits;
    if (app.preferences.rulerUnits != Units.PIXELS) {
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
    app.doForcedProgress("Preparing " +in_name +"...",'subTask()');
    function subTask(){//ESCONDE LOS LAYERS Y SE GUARDA EL PROYECTO EN FORMATO PNG
      try {
        if(!app.updateProgress(1,totalSteps)){return false;}
        var visibleLayers = hideLayers(in_doc)

      }
      catch(e) {
        if(!app.updateProgress(7,totalSteps)){return false;}
      }
      var previewFile = File(Folder.temp+"/"+in_name+".png");

        saveToPNG(in_doc, previewFile);
        retVal.isMask = 0;

      if (previewFile.exists) {
          retVal.url =  getURL(previewFile)
      }
      if(!app.updateProgress(8,totalSteps)){return false;}
      reinstateLayersVisibility(in_doc,visibleLayers)
    }
  if (app.preferences.rulerUnits != rulerUnits) {
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

  /*********************************/
  //------------------------------------------------------------------------------
  // readPreviewInfo
  // previewInfo contains an object with the
  //		height
  //		width
  // 		url of the preview
  //		selection (if any).
  //------------------------------------------------------------------------------

  function readBaseDataInfo()
  {
  	var retVal = $.getenv('com.fenikkel.HeightmapEditor.baseData');
  //  alert("base retval= " +retVal);
  	return retVal;
  }

  function readSubstracterDataInfo()
  {
    var retVal = $.getenv('com.fenikkel.HeightmapEditor.substracterData');
  //  alert("substracter retval= " +retVal);
    return retVal;
  }

  /*********************************/

  function canvasToLayer(in_contents) { //in contents tiene el formato y la compression

    var retVal = false;
  	var substractedFile = File(Folder.temp + "/substractedHeightmap.png");
  	if (substractedFile.exists) { //si existe lo borramos
  		substractedFile.remove();
  	}
  	substractedFile.encoding = "BINARY";
  	if (!substractedFile.open('w')) { //si falla algo pero no se el que...
  		return retVal.toString(); //false
  	}
  	substractedFile.write(unescape(in_contents)); //creamos el archivo... //unescape --> decodes --> https://www.w3schools.com/jsref/jsref_unescape.asp
  	substractedFile.close();
  	retVal = substractedFile.exists;

    var doc = app.activeDocument;
    var substractedDoc = app.open(substractedFile);
    substractedDoc.selection.selectAll();
    substractedDoc.selection.copy(true);

    substractedDoc.close(SaveOptions.DONOTSAVECHANGES);
    app.activeDocument = doc;
    doc.activeLayer = doc.artLayers.add(); //COMPROBAR ESTO
    doc.activeLayer.name = "Substracted Heightmap";
    doc.paste();

  	return retVal.toString();

  }

    /*********************************/
