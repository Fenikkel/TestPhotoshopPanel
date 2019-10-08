(function () {

 var csInterface = new CSInterface(); //crea una instancia de CSInterface

 var gPreviewInfo;

 function init() {
   //dispatchEvent("com.fenikkel.event.unloadEditorUI");

  setTimeout(function () {
    alert("CERRANDO");

    csInterface.closeExtension();

  }, 4000)

  //csInterface.addEventListener("com.fenikkel.event.applyChanges", getPreviewInfoCallback); //se añade un evento al principio que si es llamado desde el main de la UI como dispatchEvent("com.adobe.event.applyDissolve", JSON.stringify(gPreviewInfo)) se ejecutara
 }
/*
 function getPreviewInfoCallback (event) {
   if (event) {
     alert("hallo");
     gPreviewInfo = event.data;
     //gHasSelection = (gPreviewInfo.selection.url.length > 0);
     alert(gPreviewInfo);
     //dispatchEvent("com.fenikkel.event.unloadEditorUI"); //cerramos el UI

   } else {
     alert("cerramos extension");
     csInterface.closeExtension();
   }
 }*/


 init();

}());
