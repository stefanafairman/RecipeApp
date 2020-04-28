var classes = require('classes')

/**
 * add class to el and remove it from the same tagName siblings
 *
 * @param {Element} el
 * @param {String} [default:active] [className] optional class added for el
 * @api public
 */
module.exports = function (el, className) {
  var children = el.parentNode.childNodes
  var tagName = el.tagName
  className = className || 'active'
  for (var i = 0, l = children.length; i < l; i++) {
    var node = children[i]
    if (!node || (node.nodeType !== 1) || (node.tagName !== tagName)) continue
    if (node === el) {
      classes(node).add(className)
    } else {
      classes(node).remove(className)
    }
  }
}
