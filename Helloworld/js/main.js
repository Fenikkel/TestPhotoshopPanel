(function () {
 'use strict';

 var csInterface = new CSInterface(); //crea una instancia de CSInterface

 document.getElementById('btn_test').addEventListener('click', function () { //le añade al boton un eventlistener...
   //con esta funcion a ejecutar
   csInterface.evalScript('sayHello()'); //  the csInterface.evalScript method is used to send to the Photoshop JSX engine the 'sayHello()' string for evaluation
   //realmente va al manifest y pregunta por el JSX que
 });


 //drawImage();


}());
