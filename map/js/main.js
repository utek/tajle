var map, geojson, style, source_new;

function init() {
  map = new ol.Map({
    target: "map",
    projection: "EPSG:900913",
    view: new ol.View2D({
      center: ol.proj.transform([19, 52], 'EPSG:4326', "EPSG:900913"),
      maxZoom: 19,
      zoom: 7
    })
  });

  var osm = new ol.layer.Tile({
    source: new ol.source.OSM()
  });

  var mapquest = new ol.layer.Tile({
    source: new ol.source.MapQuest({
      layer: "osm"
    })
  });

var getText = function(feature, resolution) {
  var type = "normal";
  var maxResolution = 4000;
  var text = feature.getProperties().number;
  if (resolution > maxResolution) {
    text = '';
  } else if (type == 'hide') {
    text = '';
  } else if (type == 'shorten') {
    text = text.trunc(12);
  } else if (type == 'wrap') {
    text = stringDivider(text, 16, '\n');
  }
  return text;
};

var createTextStyle = function(feature, resolution) {
  var align = "left";
  var baseline = "middle";
  var size = "14px";
  var offsetX = 0;
  var offsetY = 0;
  var weight = "normal";
  var rotation = 0;
  var font = weight + ' ' + size + ' ' + "Arial";
  var fillColor = "#aa3300";
  var outlineColor = "#ffffff";
  var outlineWidth = 3;
  var tt = new ol.style.Text({
    textAlign: align,
    textBaseline: baseline,
    font: font,
    text: getText(feature, resolution),
    fill: new ol.style.Fill({color: fillColor}),
    stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
    offsetX: offsetX,
    offsetY: offsetY,
    rotation: rotation
  });
  return tt;
};

var createPointStyleFunction = function() {
  return function(feature, resolution) {
    var style = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({color: 'rgba(255, 255, 0, 0.6)'}),
        stroke: new ol.style.Stroke({color: 'red', width: 1})
      }),
      text: createTextStyle(feature, resolution)
    });
    return [style];
  };
};

  style = {
    'Point': createPointStyleFunction(),
    'LineString': [new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#f00',
        width: 3
      })
    })],
    'MultiLineString': [new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#f00',
        width: 3
      })
    })]
  };

  map.addLayer(osm);

  geojson = new ol.layer.Vector({
    source: new ol.source.GeoJSON({
      projection: 'EPSG:3857',
      url: 'http://apps.chladnicka.com/',
      crossOrigin: 'null'
    }),
    style: createPointStyleFunction()
  });
  map.addLayer(geojson);
}

function refresh2(){
  var source_old = geojson.getSource();
  var features_old = source_old.getFeatures();
  var features_new = source_new.getFeatures();
  for(var i=0; i<features_new.length; i++){
    for(var j=0; j<features_old.length; j++){
      if(features_new[i].getProperties().number === features_old[j].getProperties().number){
        features_old[j].setGeometry(features_new[i].getGeometry());
        break;
      }
    }
  }
}
function refresh() {
  source_new = new ol.source.GeoJSON({
    projection: 'EPSG:3857',
    url: 'http://apps.chladnicka.com/',
    crossOrigin: 'null'
  });
  source_new.on('change', refresh2);
}

$(function () {
  setInterval(refresh, 60*1000);
  var exportPNGElement = document.getElementById('export-png');

  if ('download' in exportPNGElement) {
    exportPNGElement.addEventListener('click', function (e) {
      map.once('postcompose', function (event) {
        var canvas = event.context.canvas;
        exportPNGElement.href = canvas.toDataURL('image/png');
      });
      map.render();
    }, false);
  } else {}
})
