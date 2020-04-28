# Dropdown-menu

A simple dropdown-menu component.

## Install

    npm i dropdown-menu

_Copy the css file as needed_

## Example

``` html
<div id="link" class="dropdown-menu-button">
  click me
</div>
<div class="dropdown-menu hide">
  <ul>
    <li>new repository</li>
    <li>New organization</li>
    <div class="dropdown-menu-devider"></div>
    <li>logout</li>
  </ul>
</div>
```

``` js
var dropdown = require('dropdown-menu')
var el = document.getElementById('link')
var d = dropdown(el)
d.on('select', function (li) {
  console.log(li)
})
```

## API

### dropdown(trigger, [postion], [offset])

* trigger is trigger element.
* postion is position string used for [align](https://github.com/chemzqm/align)
* offst is offset argument for [align](https://github.com/chemzqm/align)

### .hide()

hide menu element.

## Event

* `select` 
