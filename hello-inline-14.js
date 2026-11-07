
//<![CDATA[
(function () {
  const e = document.querySelectorAll(".DagPlayOpt");
  e.length > 0 && (e.forEach(t => {
    t.addEventListener("click", function (t) {
      const n = t.currentTarget,
        c = n.dataset.embed;
      document.querySelector("#pembed iframe").src = c, document.querySelector("#pembed iframe").contentWindow.location.replace(c), e.forEach(e => e.classList.remove("on")), n.classList.add("on");
      const o = document.querySelectorAll(".resIn");
      o.length > 0 && o.forEach(e => {
        e.id == n.dataset.id ? e.style.display = "block" : e.style.display = "none"
      })
    })
  }), e[0].click());
  const t = document.getElementById("shadow"),
    n = document.querySelector(".DagLight");
  t && n && (t.style.display = "none", n.addEventListener("click", function (e) {
    const n = e.currentTarget;
    t.style.height = document.body.scrollHeight, "none" == t.style.display ? (n.querySelector("span").innerHTML = "Turn on Light", n.classList.add("turnedOff"), t.style.display = "block") : (n.querySelector("span").innerHTML = "Turn off Light", n.classList.remove("turnedOff"), t.style.display = "none")
  }));
  const c = document.querySelector(".DagShre");
  c.addEventListener("click", function (e) {
    const t = document.querySelector(".gta-ms");
    t && t.classList.toggle("expand")
  })
})();
  function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("serverEpisode");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}
// Get the element with id="defaultOpen" and click on it
document.getElementById("serverOpen").click();
//]]>
