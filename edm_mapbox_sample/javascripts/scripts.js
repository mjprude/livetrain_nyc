
// var containerSize;


L.mapbox.accessToken = 'pk.eyJ1IjoibWpwcnVkZSIsImEiOiJiVG8yR2VrIn0.jtdF6eqGIKKs0To4p0mu0Q';
var map = L.mapbox.map('map', 'mjprude.kcf5kl75')
            .setView([ 40.75583970971843, -73.90090942382812 ], 12);

var shuttleStationCoordinates = [ [ -73.986229, 40.755983000933206 ], [ -73.979189, 40.752769000933171 ] ];

// ******************* SVG OVERLAY GENERATION ***********************
var svg = d3.select(map.getPanes().markerPane).append("svg");
// The "g" element to which we append thigns
var kennyPowers = svg.append("g").attr("class", "leaflet-zoom-hide");

// ******************* Projection abilities *************************

// Line projection
var transform = d3.geo.transform({
    point: projectPoint
});

var d3path = d3.geo.path().projection(transform);

function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

var toLine = d3.svg.line()
    .interpolate("linear")
    .x(function(d) {
        return applyLatLngToLayer(d).x
    })
    .y(function(d) {
        return applyLatLngToLayer(d).y
    });


// Point Projection function
function applyLatLngToLayer(d) {
    var y = d[1];
    var x = d[0];
    return map.latLngToLayerPoint(new L.LatLng(y, x));
}


// Append stations
var originTerminus = kennyPowers.selectAll(".stations")
                                .data(shuttleStationCoordinates)
                                .enter()
                                .append('circle', '.stations')
                                .attr('r', '7')
                                .style('fill', 'red')
                                .style('opacity', '1');

// ******************* Map layer reset on user zoom ****************
function reset() {

  function getBounds(){
    var northBound = map.getBounds().getNorth();
    var westBound = map.getBounds().getWest();
    return applyLatLngToLayer([ westBound, northBound ]);
  }

  function anchorMapOverlay(){
    var mapAnchorPoints = getBounds();
    // Get map pixel size
    var mapSize = map.getSize();
    var mapWidth = mapSize.x;
    var mapHeight = mapSize.y;

    // Translate the svg to deal with 
    svg.attr('x', 0)
      .attr('y', 0)
      .attr('width', mapWidth)
      .attr('height', mapHeight)
      .style('transform', function(){
        return 'translate3d(' + mapAnchorPoints.x + 'px,' + mapAnchorPoints.y + "px, 0px)";
      });
    // "Untranslate" the group that holds the station coordinates
    kennyPowers.style('transform', function(){
      return 'translate3d(' + -mapAnchorPoints.x + 'px,' + -mapAnchorPoints.y + "px, 0px)";
    });
  }

  shuttlePath.attr("d", toLine);

  originTerminus.attr('transform', function(d){
    return 'translate(' + applyLatLngToLayer(d).x + "," + applyLatLngToLayer(d).y + ")";
  });


  anchorMapOverlay();
}

map.on('viewreset', reset);
map.on('resize', reset);
map.on('move', reset);

// Adds path using mapbox....
d3.json("/subway_routes_geojson.json", function (json) {
  // Generate a GeoJSON line. You could also load GeoJSON via AJAX
  // or generate it some other way.
  // var geojson = { type: 'LineString', coordinates: [] };

  // Add this generated geojson object to the map.
  // L.geoJson(json).addTo(map);
   var featuresdata = json.features.filter(function(d) {
            
            return d.properties.route_id == "GS"
        })
  //D3 stuff...
  shuttlePath = kennyPowers.selectAll(".shuttlePath")
    .data([featuresdata[0].geometry.coordinates])
    .enter()
    .append("path")
    .attr("class", "lineConnect")
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', 5);

    reset();
});



$(function(){
  
})

