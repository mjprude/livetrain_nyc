var startingZoom = 12;
var maxZoom = 19;
var minZoom = 9;

L.mapbox.accessToken = 'pk.eyJ1IjoibWpwcnVkZSIsImEiOiJiVG8yR2VrIn0.jtdF6eqGIKKs0To4p0mu0Q';
var map = L.mapbox.map('map', 'mjprude.kcf5kl75', {
              maxZoom: maxZoom,
              minZoom: minZoom,
            })
            .setView([ 40.75583970971843, -73.90090942382812 ], startingZoom);

var shuttleStationCoordinates = [ [ -73.986229, 40.755983000933206 ], [ -73.979189, 40.752769000933171 ] ];
var originTerminus;
var shuttlePath;
var oneTrainStations;
var oneTrainPath;
// ******************* SVG OVERLAY GENERATION ***********************
var svg = d3.select(map.getPanes().markerPane).append("svg");
// The "g" element to which we append thigns
var kennyPowers = svg.append("g").attr("class", "leaflet-zoom-hide");
var sTrain = kennyPowers.append('circle');

// ******************* SCALES AND SUCH ******************************
var stationZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([1, 10]);                             

var stationStrokeZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([ 1, 5]);

var routePathZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([1, 6]);


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


// Map resize functions
// Gets map bounds to use for adjusting page resize
function getBounds(){
  var northBound = map.getBounds().getNorth();
  var westBound = map.getBounds().getWest();
  return applyLatLngToLayer([ westBound, northBound ]);
}


// ******************* Handling user map movements ****************

// Handle path and marker positions on all mouse events 
function positionReset() {

  function anchorMapOverlay(){
    var mapAnchorPoints = getBounds();
    // Get map pixel size
    var mapSize = map.getSize();
    var mapWidth = mapSize.x;
    var mapHeight = mapSize.y;

    // Translate the svg to deal with map dragging
    svg.attr('x', 0)
      .attr('y', 0)
      .attr('width', mapWidth)
      .attr('height', mapHeight)
      .style('transform', function(){
        return 'translate3d(' + mapAnchorPoints.x + 'px,' + mapAnchorPoints.y + "px, 0px)";
      });
    // "Untranslate" the group that holds the station coordinates and path
    kennyPowers.style('transform', function(){
      return 'translate3d(' + -mapAnchorPoints.x + 'px,' + -mapAnchorPoints.y + "px, 0px)";
    });
  }

  // Update line path
  shuttlePath.attr("d", toLine);
  oneTrainPath.attr("d", toLine);

  // Update station positions
  d3.selectAll('.stations').attr('transform', function(d){
    return 'translate(' + applyLatLngToLayer(d).x + "," + applyLatLngToLayer(d).y + ")";
  });

  // d3.selectAll('#marker').attr('transform', function(d) {      
  //   return 'translate(' + applyLatLngToLayer(d).x + "," + applyLatLngToLayer(d).y + ")";
  // });

  anchorMapOverlay();
}

// Event listeners for all user map movements
map.on('viewreset', positionReset);
map.on('resize', positionReset);
map.on('move', positionReset);


// Handle marker and path resizing on map zoom
function zoomReset() {
  var currentZoom = map.getZoom();

  // Resize station circles
  kennyPowers.selectAll('.stations')
              .attr('r', stationZoomScale(currentZoom))
              .attr('stroke-width', stationStrokeZoomScale(currentZoom));
  // Resize lines
  kennyPowers.selectAll('.routePath')
              .attr('stroke-width', routePathZoomScale(currentZoom));
}

// Event listener for zoom event
map.on('viewreset', zoomReset)

// Adds path using mapbox....
d3.json("/subway_routes_geojson.json", function (json) {
   // Filters feed data to pull out the shuttle route 
   // (this actually doesn't do anything right now since the json 
    // only contains the shuttle points)
   function getRoutePathById(route_id){
    return json.features.filter(function(d) {
        return d.properties.route_id === route_id;
      });
   }


  shuttlePath = kennyPowers.selectAll(".shuttlePath")
    .data([getRoutePathById("GS")[0].geometry.coordinates])
    .enter()
    .append("path")
    .attr("class", "shuttlePath routePath")
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', routePathZoomScale(startingZoom));

  oneTrainPath = kennyPowers.selectAll('.oneTrainPath')
    .data([getRoutePathById("1")[0].geometry.coordinates[0], getRoutePathById("1")[0].geometry.coordinates[1] ])
    .enter()
    .append('path')
    .attr('class', 'oneTrainPath routePath')
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-width', routePathZoomScale(startingZoom));


  // Append stations
  originTerminus = kennyPowers.selectAll(".stations")
                                  .data(shuttleStationCoordinates)
                                  .enter()
                                  .append('circle')
                                  .attr('class', 'station-GS stations')
                                  .attr('r', stationZoomScale(startingZoom))
                                  .style('fill', 'white')
                                  .style('opacity', '1')
                                  .attr('stroke', 'grey')
                                  .attr('stroke-width', stationStrokeZoomScale(startingZoom));
  


  //***************** ANIMATION ******************

  svg.select('path.shuttlePath').call(transition)

  var startPoint = shuttlePath.node().getPointAtLength(0);

  sTrain.attr('r',5)
      .attr("id", "marker")
      .style('fill', 'red')
      .attr("transform", "translate("+ startPoint.x+","+startPoint.y+")");

  function transition(path) {
    shuttlePath.transition()
        .duration(10000)
        .ease('linear')
        .attrTween('line', tweenDash)     
  }

  function tweenDash() {
    var l = shuttlePath.node().getTotalLength();
    // var i = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr

    return function(t) {
      var sTrain = d3.select("#marker");
      var p = shuttlePath.node().getPointAtLength(t * l);

      sTrain.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker
      // return i(t);
    }
  }
    
  //call positionReset to populate the lines and such...
  // positionReset();
});

d3.json("/subway_stops_geojson.json", function (json) {

   function getStationsById(route_id){
    var filteredResults = json.features.filter(function(feature) {
        return feature.properties.Routes_ALL.indexOf(route_id) > -1;
      });
    var stations = [];
    for (var i = 0; i < filteredResults.length; i++ ) {
      stations.push(filteredResults[i].geometry.coordinates);
    }
    return stations;
   }
  oneTrainStationCoordinates = getStationsById('1');

  oneTrainStations = kennyPowers.selectAll('.station-1')
                                .data(oneTrainStationCoordinates)
                                .enter()
                                .append('circle')
                                .attr('class', 'station-1 stations')
                                .attr('r', stationZoomScale(startingZoom))
                                .style('fill', 'white')
                                .style('opacity', '1')
                                .attr('stroke', 'red')
                                .attr('stroke-width', stationStrokeZoomScale(startingZoom));

  positionReset();

});



$(function(){
  
})

