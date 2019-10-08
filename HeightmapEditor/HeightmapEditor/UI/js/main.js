(function () {

 var csInterface = new CSInterface(); //crea una instancia de CSInterface

 document.getElementById('btn_test').addEventListener('click', function () { //le añade al boton un eventlistener...

   //paintCanvas();
   requestApplyDissolve();

 });


 function requestApplyDissolve(event) {


     csInterface.requestOpenExtension("com.fenikkel.HeightmapEditor.ApplyChanges", "") //function(extensionId, params)
     /*setTimeout(function () { //hace la funcion despues de medio segundo
       dispatchEvent("com.adobe.event.applyDissolve", JSON.stringify(gPreviewInfo))
     }, 500)*/

 }


}());
