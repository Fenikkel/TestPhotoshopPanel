/*************************************************************************
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

(function () {
	var csInterface = new CSInterface();
	var gWidthRatio = 1; //aspect ratio
	var gFittedPreviewRect = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};
	var gFittedSelectionRect = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};
	var gSelectionContext = null;
	var gImageSelectionData = null;
	var gImagePreviewData = null;
	//Stores the info about the preview
	var gPreviewInfo = {}; //tendra los valores de previewInfo que se obtienen en el jsx
	var gHasSelection = false;


	//------------------------------------------------------------------------------
	// init
	//------------------------------------------------------------------------------

	function init() {
		csInterface.addEventListener("com.adobe.event.unloadDissolveExtension", closeExtension); //ponemos la funcion closeExtension en el csInterface y luego en el '.cancelBtn' le ponemos la funcion csInterface.closeExtension(); cuando hace el mensaje "click"
		themeManager.init(); //configura el css
		csInterface.setWindowTitle("Simple Dissolve"); //para poner titulo a la ventana
		getDefaultSettings();
		csInterface.evalScript("readPreviewInfo()", drawPreviewCallback); //csInterface.evalScript('jsx_func_in_jsx_file(' + passing_param + ')', function(response) {  handing response  });
		$('#iDissolvePc').focus(); //para hacer focus al editar el porcentaje nada mas entrar al panel //https://www.w3schools.com/jquery/tryit.asp?filename=tryjquery_event_focus_ref
	}

	//------------------------------------------------------------------------------
	// closeExtension - closes this extension
	//------------------------------------------------------------------------------

	function closeExtension(event) {
		csInterface.closeExtension();
	}

	//------------------------------------------------------------------------------
	// drawPreviewCallback Retrieves the preview information
	// and draws the preview in canvas
	//------------------------------------------------------------------------------

	function drawPreviewCallback(in_resultStr) {
		if (in_resultStr !== 'false') { //si hay previewInfo
			eval("gPreviewInfo = " + in_resultStr) //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/eval
			gHasSelection = (gPreviewInfo.selection.url.length > 0);
			loadPreview();
			if (gHasSelection) {
				loadSelection();
			}
		}
		document.onkeydown = onKeyDownCallbak;
	}

	//------------------------------------------------------------------------------
	// storeDefaultSetting - Stores locallyt the dialog
	// settings (percent and disposition)
	//------------------------------------------------------------------------------

	function storeDefaultSettings() {
		localStorage.setItem( //localStorage.setItem(keyname, value)
			"com.adobe.phxs.simpledissolve", //key
			JSON.stringify({ //values
				'percent': $('#iDissolvePc').val(), //% de dissolve
				'disposition': $('input[name=radioDispo]:checked').val() //guardamos el radio que esta cheked
			})
		);
	}

	//------------------------------------------------------------------------------
	// getDeafaultSettings - Retrieves the dialog settings (percent and disposition)
	//------------------------------------------------------------------------------

	function getDefaultSettings() {
		var str = localStorage.getItem("com.adobe.phxs.simpledissolve");
		if (str) {
			var settings = JSON.parse(str);
			$('#iDissolvePc').val(settings.percent);
			$("input[name=radioDispo][value=" + settings.disposition + "]").prop('checked', true);
		}
	}

	//------------------------------------------------------------------------------
	// dispatchEvent - dispatches a CEP event
	//------------------------------------------------------------------------------

	function dispatchEvent(in_eventStr, in_data) {
		var msgEvent = new CSEvent(in_eventStr);
		msgEvent.scope = "APPLICATION";
		msgEvent.data = in_data;
		msgEvent.appId = csInterface.getApplicationID();
		msgEvent.extensionId = csInterface.getExtensionID();
		csInterface.dispatchEvent(msgEvent);
	}

	//------------------------------------------------------------------------------
	// updatePreview - resinstates the orginal preview and then apply dissolve
	// effect.
	//------------------------------------------------------------------------------

	function updatePreview() {
		var previewContext = $('#cnvsPreview')[0].getContext("2d");
		previewContext.clearRect(0, 0, $('#cnvsPreview').width(), $('#cnvsPreview').height());
		previewContext.drawImage(gImagePreviewData, gFittedPreviewRect.x, gFittedPreviewRect.y, gFittedPreviewRect.width, gFittedPreviewRect.height);
		if (gHasSelection) {
			var selectionData = gSelectionContext.getImageData(0, 0, gFittedSelectionRect.width, gFittedSelectionRect.height);
			var previewData = previewContext.getImageData(gFittedSelectionRect.x, gFittedSelectionRect.y, gFittedSelectionRect.width, gFittedSelectionRect.height);
			var x = gFittedSelectionRect.x;
			var y = gFittedSelectionRect.y;
		} else {
			var previewData = previewContext.getImageData(gFittedPreviewRect.x, gFittedPreviewRect.y, gFittedPreviewRect.width, gFittedPreviewRect.height);
			var x = gFittedPreviewRect.x;
			var y = gFittedPreviewRect.y;
		}
		var disposition = $('input[name=radioDispo]:checked').val();
		var dataIdx = 0;
		while (dataIdx < previewData.data.length) {
			if (gHasSelection) {
        //porque dissolvePixel no se inicializa?
				dissolvePixel = (selectionData.data[dataIdx + 3] != 0 && doDissolvePixel());  //si el pixel esta en la sellecion y se pide que se haga el dissolve devolvemos true
			} else {
				dissolvePixel = doDissolvePixel();
			}
			if (dissolvePixel) {
				switch (disposition) { //coloreamos segun lo que hemos elegido
					case "0":
						previewData.data[dataIdx] = 255;
						previewData.data[dataIdx + 1] = 255;
						previewData.data[dataIdx + 2] = 255;
						break;
					case "1":
						previewData.data[dataIdx] = (gPreviewInfo.isMask == '1' ? 69 : 0);
						previewData.data[dataIdx + 1] = (gPreviewInfo.isMask == '1' ? 69 : 0);
						previewData.data[dataIdx + 2] = (gPreviewInfo.isMask == '1' ? 69 : 255);
						break;
					case "2":
						previewData.data[dataIdx] = (gPreviewInfo.isMask == '1' ? 129 : 255);
						previewData.data[dataIdx + 1] = (gPreviewInfo.isMask == '1' ? 129 : 0);
						previewData.data[dataIdx + 2] = (gPreviewInfo.isMask == '1' ? 129 : 0);
						break;
					case "3":
						previewData.data[dataIdx] = (gPreviewInfo.isMask == '1' ? 200 : 0);
						previewData.data[dataIdx + 1] = (gPreviewInfo.isMask == '1' ? 200 : 255);
						previewData.data[dataIdx + 2] = (gPreviewInfo.isMask == '1' ? 200 : 0);
						break;
				}
				previewData.data[dataIdx + 3] = 255; //pintamos de blanco siempre el 4to?
			}
			dataIdx = dataIdx + 4; //pintamos de 4 pixeles en 4
		}
		previewContext.putImageData(previewData, x, y); //ponemos al preview lo que hemos hecho
	}

	//------------------------------------------------------------------------------
	// doDissolvePixel - decides if a pixel should be colored base on the
	// dissolve percentage.
	//------------------------------------------------------------------------------

	function doDissolvePixel() {
		var rand = Math.floor((Math.random() * 100) + 1); //valor del 1 al 101?
		return (rand <= parseFloat($('#iDissolvePc').val())); //si el valor random es menor que el porcentaje del panel devolvemos true
	}

	//------------------------------------------------------------------------------
	// loadPreview - draws the previews on a canvas.
	// Once the preview has be loaded it updates the dissolve
	//------------------------------------------------------------------------------

	function loadPreview() {
		var cnvsHeight = $('#cnvsPreview').height(); //Selector -> https://stackoverflow.com/questions/2167544/what-does-the-function-do-in-javascript/2167561#2167561 --> funcion de jQuery
		var cnvsWidth = $('#cnvsPreview').width();
		var previewSize = rescale({ //llamamos nuestra funcion rescale con los tamaños del canvas y del preview para hacer el preview proporcional al canvas
			width: cnvsWidth,
			height: cnvsHeight
		}, {
			width: gPreviewInfo.width,
			height: gPreviewInfo.height
		});
		gFittedPreviewRect.width = previewSize.width;
		gFittedPreviewRect.height = previewSize.height;
		gWidthRatio = gFittedPreviewRect.width / gPreviewInfo.width;
		gFittedPreviewRect.x = Math.round(($('#cnvsPreview').width() - gFittedPreviewRect.width) / 2);
		gFittedPreviewRect.y = Math.round(($('#cnvsPreview').height() - gFittedPreviewRect.height) / 2);
		gImagePreviewData = new Image();
		var context = $('#cnvsPreview')[0].getContext("2d");
		gImagePreviewData.onload = function () { //dibujamos imagen en el canvas cuando se carga la pagina
			context.drawImage(gImagePreviewData, gFittedPreviewRect.x, gFittedPreviewRect.y, gFittedPreviewRect.width, gFittedPreviewRect.height); //context.drawImage(img,x,y,width,height);
			updatePreview();
		};
		gImagePreviewData.src = gPreviewInfo.url; //le ponemos el url de la imagen que queremos dibujar
	}

	//------------------------------------------------------------------------------
	// rescale - calculates the width and height to fit the preview proportionally
	// in the canvas.
	//------------------------------------------------------------------------------

	function rescale(in_rect, in_img) {
		var retVal = in_img;
		if (in_img.width > in_rect.width || in_img.height > in_rect.height) { //si la imagen del preview es mayor que el canvas...
			var rectRatio = in_rect.height / in_rect.width;
			var imgRation = in_img.height / in_img.width;
			if (rectRatio > imgRation) {  //si el canvas es mas alto en cuanto aspect ratio(altura/ancho) que la imagen preview...
				var ratio = (in_rect.width / in_img.width);
			} else {
				var ratio = (in_rect.height / in_img.height);
			}
			retVal.width = Math.floor(retVal.width * ratio);
			retVal.height = Math.floor(retVal.height * ratio);
		}
		return retVal;
	}

	//------------------------------------------------------------------------------
	// loadSelection - draws the selection offscreen.
	//------------------------------------------------------------------------------

	function loadSelection() {
		var offscreenCanvas = document.createElement('canvas');
		offscreenCanvas.id = "cnvsSelection";
		gFittedSelectionRect.width = Math.floor(gPreviewInfo.selection.rect.width * gWidthRatio);
		gFittedSelectionRect.height = Math.floor(gPreviewInfo.selection.rect.height * gWidthRatio);
		gFittedSelectionRect.x = Math.floor(gPreviewInfo.selection.rect.x * gWidthRatio) + gFittedPreviewRect.x;
		gFittedSelectionRect.y = Math.floor(gPreviewInfo.selection.rect.y * gWidthRatio) + gFittedPreviewRect.y;
		offscreenCanvas.width = gFittedSelectionRect.width;
		offscreenCanvas.height = gFittedSelectionRect.height;
		gSelectionContext = offscreenCanvas.getContext('2d');
		gImageSelectionData = new Image();
		gImageSelectionData.onload = function () {
			gSelectionContext.drawImage(gImageSelectionData, 0, 0, gFittedSelectionRect.width, gFittedSelectionRect.height);
			updatePreview();
		};
		gImageSelectionData.src = gPreviewInfo.selection.url;
	}

	//------------------------------------------------------------------------------
	// requestApplyDissolve - We are ready to apply the filter
	// We now open an invisible panel (SimpleDissolveSupport) so we close the dialog
	// SimpleDissolveSupport will apply the dissolve
	//------------------------------------------------------------------------------

	function requestApplyDissolve(event) {
		gPreviewInfo.disposition = $('input[name=radioDispo]:checked').val();
		gPreviewInfo.percent = parseFloat($('#iDissolvePc').val());
		storeDefaultSettings();
		if (gPreviewInfo.percent > 0) {
			csInterface.requestOpenExtension("com.adobe.SimpleDissolve.ApplyFilter", "")
			setTimeout(function () {
				dispatchEvent("com.adobe.event.applyDissolve", JSON.stringify(gPreviewInfo))
			}, 500)
		} else {
			csInterface.closeExtension();
		}
	}

	//------------------------------------------------------------------------------
	// Handles key down events <esc> and  Enter/Return
	//------------------------------------------------------------------------------

	function onKeyDownCallbak(event) {
		if (event.keyCode == 27) { //27 -> esc
			csInterface.closeExtension();
		} else if (event.keyCode == 13) { //13 -> enter
			requestApplyDissolve();
		}
	}

	//------------------------------------------------------------------------------
	// Triggers a preview update if the dissolve perecentage changes
	//------------------------------------------------------------------------------

	$('#iDissolvePc').change(function () { //cada vez que cambia el valor se hace un update del preview
		$(this).select(); //selecciona todo el texto del %
		updatePreview();
	});

	//------------------------------------------------------------------------------
	// Triggers a preview update if the "disposition" changes
	//------------------------------------------------------------------------------

	$('input[name=radioDispo]:radio').change(function () {
		$("#iDissolvePc").focus();
		updatePreview();
	});

	//------------------------------------------------------------------------------
	// The user clicked the OK button
	//------------------------------------------------------------------------------

	$('.okBtn').click(function () {
		requestApplyDissolve();
	});

	//------------------------------------------------------------------------------
	// The user cancelled, time to close this extension
	//------------------------------------------------------------------------------

	$('.cancelBtn').click(function () {
		csInterface.closeExtension();
	});

	//------------------------------------------------------------------------------
	// Triggers a preview update if the dissolve percentage changed
	//------------------------------------------------------------------------------

	$('#iDissolvePc').on('keyup', function () { //cada vez que tecleamos hace un update del preview y si te pasas te da un valor por defecto
		var val = $(this).val()
		if (val > 100) {
			$(this).val(100);
			$(this).select();
		} else if (val == "") {
			$(this).val(0);
			$(this).select();
		}
		updatePreview();
	})

	init(); //llamamos a la funcion init

}());
