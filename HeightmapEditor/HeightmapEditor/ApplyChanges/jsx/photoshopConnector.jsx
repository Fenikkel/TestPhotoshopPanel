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
  $.setenv('com.fenikkel.HeightmapEditor.baseData',baseInfoObj.toSource());
  $.setenv('com.fenikkel.HeightmapEditor.substracterData',substracterInfoObj.toSource());


  app.activeDocument = mainDoc;

}

function createData(in_doc, in_name){


    blockRefresh();
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
        if(!app.updateProgress(2,totalSteps)){return false;}
        //copy();
        if(!app.updateProgress(3,totalSteps)){return false;}
        //activeDocument.activeLayer = activeDocument.artLayers[4];
        if(!app.updateProgress(4,totalSteps)){return false;}

        //paste();

        // yes we skipped some steps because export image takes longer
        if(!app.updateProgress(6,totalSteps)){return false;}
        if(!app.updateProgress(7,totalSteps)){return false;}

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
