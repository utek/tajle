var map, geojson, style, source_new;

function init() {
    var legend = [{
        name: "On time",
        class: "_0"
    }, {
        name: "5min. delay",
        class: "_1"
    }, {
        name: "10min. delay",
        class: "_2"
    }, {
        name: ">10min. delay",
        class: "_3"
    }]
    map = new ol.Map({
        controls: ol.control.defaults().extend([
            new utk.Legend({
                elements: legend
            })
        ]),
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
        }
        return text;
    };
    var statusColors = function(feature) {
        var status = feature.getProperties().status;
        var color;
        if (status < 0) {
            color = new ol.style.Fill({
                color: 'rgba(255, 255, 0, 0.9)'
            });
        } else if (status < 5) {
            color = new ol.style.Fill({
                color: 'rgba(0, 165, 0, 0.9)'
            });
        } else if (status < 10) {
            color = new ol.style.Fill({
                color: 'rgba(165, 165, 0, 0.9)'
            });
        } else if (status < 999) {
            color = new ol.style.Fill({
                color: 'rgba(255, 165, 0, 0.9)'
            });
        } else {
            color = new ol.style.Fill({
                color: 'rgba(165, 0, 0, 0.9)'
            });
        }
        return color;
    }
    var createTextStyle = function(feature, resolution) {
        var align = "left";
        var baseline = "middle";
        var size = "14px";
        var offsetX = 5;
        var offsetY = 10;
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
            fill: new ol.style.Fill({
                color: fillColor
            }),
            stroke: new ol.style.Stroke({
                color: outlineColor,
                width: outlineWidth
            }),
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
                    fill: statusColors(feature),
                    stroke: new ol.style.Stroke({
                        color: 'red',
                        width: 1
                    })
                }),
                text: createTextStyle(feature, resolution)
            });
            return [style];
        };
    };
    map.addLayer(osm);
    geojson = new ol.layer.Vector({
        source: new ol.source.GeoJSON({
            projection: 'EPSG:3857',
            url: DATA_URL,
            crossOrigin: 'null'
        }),
        style: createPointStyleFunction()
    });
    map.addLayer(geojson);
}

function refresh2() {
    var source_old = geojson.getSource();
    var features_old = source_old.getFeatures();
    var features_new = source_new.getFeatures();
    var exist = false;
    source_old.clear();
    source_old.addFeatures(features_new);
}

function refresh() {
    source_new = new ol.source.GeoJSON({
        projection: 'EPSG:3857',
        url: DATA_URL,
        crossOrigin: 'null'
    });
    source_new.on('change', refresh2);
}
$(function() {
    init();
    refresh();
    setInterval(refresh, 20 * 1000);
    var exportPNGElement = document.getElementById('export-png');
    if ('download' in exportPNGElement) {
        exportPNGElement.addEventListener('click', function(e) {
            map.once('postcompose', function(event) {
                var canvas = event.context.canvas;
                exportPNGElement.href = canvas.toDataURL('image/png');
            });
            map.render();
        }, false);
    } else {}
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');
    closer.onclick = function() {
        container.style.display = 'none';
        closer.blur();
        return false;
    };
    var overlay = new ol.Overlay({
        element: container
    });
    map.addOverlay(overlay);
    map.on('click', function(evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            return feature;
        });
        if (feature) {
            var geometry = feature.getGeometry();
            var coord = geometry.getCoordinates();
            overlay.setPosition(coord);
            content.innerHTML = '<h4>Train no: ' + feature.get('number') + '</h4>' + '<p>Nearest city: ' + feature.get('nearest_city') + '</p>' + '<p>Train path: ' + feature.get('path') + '</p>' + '<p>Position on: ' + feature.get('date') + '</p>';
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    });
})