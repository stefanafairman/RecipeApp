require('../dropdown-menu.css')
var dropdown = require('..')
var el = document.getElementById('link')
var d = dropdown(el)
d.on('select', function (li) {
  console.log(li)
  d.hide()
})
