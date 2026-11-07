/*<![CDATA[*/
function searchToggle() {
   var element = document.getElementById("search");
   element.classList.toggle("block");
}
function copyFunction(){document.getElementById("getlink").select(),document.execCommand("copy"),document.getElementById("share-notif").innerHTML="<span>Link copied!</span>" };
function changeFont(){var x=document.getElementById('post-font');if(x.classList)x.classList.toggle('active');else{var z=x.className.split(' ');0<=(t=z.indexOf('active'))?z.splice(t,1):z.push('active'),x.className=z.join(' ')}};
function myFunction() {
   var element = document.getElementById("mdl-download");
   element.classList.toggle("on");
}
/*]]>*/
      