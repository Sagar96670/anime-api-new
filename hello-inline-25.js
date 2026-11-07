
var root = document.documentElement
var button = document.querySelector('.nsfw-mode')
button.addEventListener('click', () => {
  root.classList.toggle('sfw')
  if (root.classList.contains('sfw')) {
    localStorage.setItem('isDark', '1')
  } else {
    localStorage.removeItem('isDark')
  }
})
