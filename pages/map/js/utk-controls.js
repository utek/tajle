var utk=utk||{};utk.Legend=function(e){for(var n=e||{elements:[]},t=[],l=0;l<n.elements.length;l++){var o=document.createElement("div");o.innerHTML='<span class="'+n.elements[l].class+' utk-legend-element">&nbsp;&nbsp;</span><strong>'+n.elements[l].name+"</strong>",t.push(o)}var r=document.createElement("div");for(r.className="utk-legend ol-control",l=0;l<t.length;l++)r.appendChild(t[l]);ol.control.Control.call(this,{element:r,target:n.target})},ol.inherits(utk.Legend,ol.control.Control);