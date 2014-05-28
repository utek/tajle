var map, geojson, style;

function init() {
  map = new ol.Map({
    target: "map",
    projection: "EPSG:900913",
    view: new ol.View2D({
      center: ol.proj.transform([19, 52], 'EPSG:4326', "EPSG:900913"),
      maxZoom: 19,
      zoom: 5
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
  style = {
    'Point': [new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({
          color: 'rgba(255,255,0,1)'
        }),
        radius: 5,
        stroke: new ol.style.Stroke({
          color: '#f00',
          width: 2
        })
      })
    })],
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
      url: 'http://127.0.0.1:6543/',
      crossOrigin: 'null'
    }),
    style: function (feature, resolution) {
      return style[feature.getGeometry().getType()];
    }
  });
  map.addLayer(geojson);
}

function refresh() {
  var source_new = new ol.source.GeoJSON({
    projection: 'EPSG:3857',
    url: 'http://127.0.0.1:6543/',
    crossOrigin: 'null'
  });
  var source_old = geojson.getSource();
  var features_old = source_old.getFeatures();
  var features_new = source_new.getFeatures();
  for(var i=0; i<features_new.length; i++){
    for(var j=0; j<features_old.length; j++){
      if(features_new[i].getProperties().number === features_old[j].getProperties().number){
        features_old[i].setGeometry(features_new[i].getGeometry);
        break;
      }
    }
  }


}

$(function () {
  setInterval(refresh, 20*1000);
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