//<![CDATA[
function displayNum(){
var dataLocal = JSON.parse(localStorage.getItem('bookmark'));
let num = 0;
for(var item in dataLocal){
num++
}
$('.numshow').html(num);
}
displayNum();
    //]]>