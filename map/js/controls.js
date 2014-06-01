window.app = {};
var app = window.app;

/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
app.Legend = function(opt_options) {

  var options = opt_options || {elements: []};
  var elements = [];
  for (var i = 0; i < options.elements.length; i++) {
    var div = document.createElement('div');
    div.innerHTML = '<span class="'+options.elements[i].class+
    ' legend-element">&nbsp;&nbsp;</span><strong>'+options.elements[i].name+'</strong>';
    elements.push(div);
  };

  var this_ = this;

  /* creating legend box */
  var element = document.createElement('div');
  element.className = 'legend ol-unselectable';
  for (var i = 0; i < elements.length; i++) {
    element.appendChild(elements[i]);
  };

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

};
ol.inherits(app.Legend, ol.control.Control);
