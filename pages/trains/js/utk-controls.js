var utk=utk||{};utk.Legend=function(e){for(var n=e||{elements:[]},t=[],l=0;l<n.elements.length;l++){var s=document.createElement("div");s.innerHTML='<span class="'+n.elements[l].class+' utk-legend-element">&nbsp;&nbsp;</span><strong>'+n.elements[l].name+"</strong>",t.push(s)}var o=document.createElement("div");for(o.className="utk-legend ol-unselectable",l=0;l<t.length;l++)o.appendChild(t[l]);ol.control.Control.call(this,{element:o,target:n.target})},ol.inherits(utk.Legend,ol.control.Control);