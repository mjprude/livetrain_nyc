var startingZoom = 12;
var maxZoom = 19;
var minZoom = 9;

var fakeJSON = [{
  trainId: '1',
  tripOne: {
    path: 'path-22',
    percentComplete: 0,
    duration: 5000,
    timeUntilDeparture: 0,
  },
  tripTwo: {
    path: 'path-24',
    percentComplete: 0,
    duration: 5000,
    timeUntilDeparture: 3000,
  }
}];

var shuttleStopCoordinates = [ [ -73.986229, 40.755983000933206 ], [ -73.979189, 40.752769000933171 ] ];
var shuttlePath;
var shuttlePathLength;
var sTrain;

L.mapbox.accessToken = 'pk.eyJ1IjoibWpwcnVkZSIsImEiOiJiVG8yR2VrIn0.jtdF6eqGIKKs0To4p0mu0Q';
var map = L.mapbox.map('map', 'mjprude.kcf5kl75', {
              maxZoom: maxZoom,
              minZoom: minZoom,
            })
            .setView([ 40.75583970971843, -73.90090942382812 ], startingZoom);

// ******************* SVG OVERLAY GENERATION ***********************
var svg = d3.select(map.getPanes().markerPane).append("svg");
// The "g" element to which we append thigns
var staticGroup = svg.append("g").attr("class", "leaflet-zoom-hide");
// var dynamicGroup = svg.append("g").attr("class", "leaflet-zoom-hide");

// ******************* SCALES AND SUCH ******************************
var stopZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([1, 10]);                             

var stopStrokeZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([ 1, 5]);

var routePathZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([1, 6]);


// ******************* Projection abilities *************************
<<<<<<< HEAD

  function animate(percentComplete, duration, timeUntilDeparture) {
    timeUntilDeparture = timeUntilDeparture || 0
    var startPoint = shuttlePath.node().getPointAtLength(shuttlePathLength * percentComplete);
    d3.select('#marker').remove();

    sTrain = staticGroup.append('circle')
                            .attr('r',5)
                            .attr("id", "marker")
                            .style('fill', 'grey')
                            .attr("transform", "translate("+ startPoint.x+","+startPoint.y+")");

    function transition(path) {
      shuttlePath.transition()
          .duration(duration / (1 - percentComplete))
          .ease('linear')
          .attrTween('custom', tweenDash)     
    }

    function tweenDash() {
      // var i = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr
      // map.on('viewReset', function(){ l = shuttlePath.node().getTotalLength(); })
      return function(t) {
        var p = shuttlePath.node().getPointAtLength(t * shuttlePathLength + percentComplete * shuttlePathLength);
        sTrain.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker
        // return i(t);
        if (t >= 1 - percentComplete) {
          setTimeout(function(){ d3.select('#marker').style('opacity', '0'); },0);
        }
      }
    }
    setTimeout(function() { svg.select('path.shuttlePath').call(transition) },timeUntilDeparture)
  }


=======
>>>>>>> 089e0c09c63dfc2619ebc9f18fb1bc8de614e696
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
        return applyLatLngToLayer(d).x;
    })
    .y(function(d) {
        return applyLatLngToLayer(d).y;
    });


// Point Projection function
function applyLatLngToLayer(d) {
    var y = d[1];
    var x = d[0];
    return map.latLngToLayerPoint(new L.LatLng(y, x));
};

// Use to position stops
function stopApplyLatLngToLayer(d) {
    var y = d.coordinates[1];
    var x = d.coordinates[0];
    return map.latLngToLayerPoint(new L.LatLng(y, x)); 
};

// Map resize functions
// Gets map bounds to use for adjusting page resize
function getBounds(){
  var northBound = map.getBounds().getNorth();
  var westBound = map.getBounds().getWest();
  return applyLatLngToLayer([ westBound, northBound ]);
};

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
    // "Untranslate" the group that holds the stop coordinates and path
    staticGroup.style('transform', function(){
      return 'translate3d(' + -mapAnchorPoints.x + 'px,' + -mapAnchorPoints.y + "px, 0px)";
    });
  }

  // Update STATIC routePaths
  d3.selectAll('.routePath').attr('d', toLine);

  // Update STOP positions and OVERLAYS
  d3.selectAll('.stops').attr('transform', function(d){
    return 'translate(' + stopApplyLatLngToLayer(d).x + ',' + stopApplyLatLngToLayer(d).y + ")";
  });
  d3.selectAll('.stopOverlays').attr('transform', function(d){
    return 'translate(' + stopApplyLatLngToLayer(d).x + ',' + stopApplyLatLngToLayer(d).y + ")";
  });

  anchorMapOverlay();
}

// Event listeners for all user map movements
map.on('viewreset', positionReset);
map.on('resize', positionReset);
map.on('move', positionReset);


// ************** Handle marker and path resizing on user map zoom ***********************
function zoomReset() {
  var currentZoom = map.getZoom();

  // Resize Stop circles
  staticGroup.selectAll('.stops')
              .attr('r', stopZoomScale(currentZoom))
              .attr('stroke-width', stopStrokeZoomScale(currentZoom));
  staticGroup.selectAll('.stopOverlays')
              .attr('r', stopZoomScale(currentZoom))
              .attr('stroke-width', stopStrokeZoomScale(currentZoom))
              .attr('stroke-dasharray', function(){ 
                return ( (2 * (stopZoomScale(currentZoom)) * Math.PI)/2 + ', ' + (2 * (stopZoomScale(currentZoom)) * Math.PI)/2 );
              });

  shuttlePathLength = shuttlePath.node().getTotalLength()
  // Resize lines
  staticGroup.selectAll('.routePath')
              .attr('stroke-width', routePathZoomScale(currentZoom));
}

// Event listener for zoom event
map.on('viewreset', zoomReset)


// ********************** LOAD JSON - STATIC DATA (STOPS AND LINES) ********************
d3.json("/irt_routes_and_stops.json", function (json) {

  // Add routes to map
  var routes = json.routes;
  var routeGroup = staticGroup.append('g')
              .attr('class', 'routeGroup')
              .attr('opacity', .5);

  for (var i = 0; i < routes.length; i++){
    var className = "route-" + routes[i].route_id;
    var pathId = "path-" + i;
    routeGroup.selectAll(pathId)
              .data([routes[i].path_coordinates])
              .enter()
              .append('path')
              .attr('id', pathId)
              .attr('class', 'routePath ' + className)
              .attr('fill', 'none')
              // .attr('stroke', 'rgb' + routes[i].color)
              .attr('stroke', 'grey')
              .style('opacity', 1)
              .attr('stroke-width', routePathZoomScale(startingZoom));    
  }

  var stopGroup = staticGroup.append('g')
              .attr('class', 'stopGroup')

  // Add Stops to map
  var stops = json.stops;
  stopGroup.selectAll('stops')
            .data(stops)
            .enter()
            .append('circle')
            .attr('r', stopZoomScale(startingZoom))
            .attr('id', function(d){ return d.stop_id; })
            .attr('class', 'stops')
            .attr('opacity', 1)
            .attr('fill', 'white')
            .attr('stroke', function(d){ return 'rgb' + d.colors[0]; })
            .attr('stroke-width', stopStrokeZoomScale(startingZoom));

  // ...and the overlays necessary for the dash effect
  stopGroup.selectAll('stopOverlays')
            .data(stops)
            .enter()
            .append('circle')
            .attr('r', stopZoomScale(startingZoom))
            .attr('class', 'stopOverlays')
            .attr('fill', 'none')
            .attr('stroke', function(d) {
              if (d.colors.length > 1){
                return 'rgb' + d.colors[1];
              } else {
                return 'rgb' + d.colors[0];
              }
            })
            .attr('stroke-width', stopStrokeZoomScale(startingZoom));

  shuttlePath = d3.select('#path-22');

  // call positionReset and zoomReset to populate the stops and lines and such...
  positionReset();
  zoomReset();
    
  
});// end of static JSON call


// ************************ ANIMATION **************************************
function animateSingle(){
  var trains = staticGroup.selectAll('trains')
                          .data(fakeJSON, function(d){ return d.trainId; })
    
  trains.enter()
    .append('circle')
    .attr('class', 'trains')
    .attr('r', 5)
    .attr('id', function(d){ return 'train-' + d.trainId;})
    .style('fill', 'blue')
    .attr("transform", function(d) { return "translate(" + getStartPointOne(d).x+"," + getStartPointOne(d).y + ")" });

  function getStartPointOne(d){
    var path = d3.select('#' + d.tripOne.path);
    return path.node().getPointAtLength(path.node().getTotalLength() * d.tripOne.percentComplete);
  }
  
  trains.transition()
        .delay(function(d){ return d.tripOne.timeUntilDeparture; })
        .duration(function(d){ return d.tripOne.duration / (1 - d.tripOne.percentComplete )})
        .ease('linear')
        .attrTween('transform', function(d){
          var path = d3.select('#' + d.tripOne.path);
          return tweenTrain(path, d.tripOne.percentComplete);
        })
        .transition()
        .duration(function(d){ return d.tripTwo.timeUntilDeparture; })
        .attrTween('transform', function(d){
          var path = d3.select('#' + d.tripTwo.path);
          return holdTrain(path);
        })
        .transition()
        .duration(function(d){ return d.tripTwo.duration})
        .ease('linear')
        .attrTween('transform', function(d){
          var path = d3.select('#' + d.tripTwo.path);
          return tweenTrain(path, d.tripTwo.percentComplete);
        });

  function tweenTrain(path, percentComplete) {
    return function(t) {
      var p = path.node().getPointAtLength(t * (path.node().getTotalLength()) + percentComplete * (path.node().getTotalLength()));
      return 'translate(' + p.x + ',' + p.y + ')';
    }
  }

  function holdTrain(path) {
    return function(t) {
      var startPoint = path.node().getPointAtLength(0);
      return 'translate(' + startPoint.x + ',' + startPoint.y + ')';
    }
  }
}
  
console.log(" ,<-------------->,");
console.log("/                  \\\ ");
console.log("| ,---,,----,,---, |");
console.log("| |   ||    ||(1)| |");
console.log("| '---'|    |'---' |");
console.log("|    ()|'..'|()    |");
console.log("|    ()|'..'|()    |");
console.log("|      |    |      |");
console.log("'+-----======-----+'");
console.log("    ||        ||");
// ********************* ANIMATION **************
//   function animate(percentComplete, duration, timeUntilDeparture){
//     timeUntilDeparture = timeUntilDeparture || 0
//     var startPoint = shuttlePath.node().getPointAtLength(shuttlePathLength * percentComplete);
//     d3.select('#marker').remove();

//     sTrain = staticGroup.append('circle')
//                             .attr('r',5)
//                             .attr("id", "marker")
//                             .style('fill', 'grey')
//                             .attr("transform", "translate("+ startPoint.x+","+startPoint.y+")");

//     function transition(path) {
//       shuttlePath.transition()
//           .duration(duration / (1 - percentComplete))
//           .ease('linear')
//           .attrTween('custom', tweenDash)     
//     }

//     function tweenDash() {
//       // var i = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr
//       // map.on('viewReset', function(){ l = shuttlePath.node().getTotalLength(); })
//       return function(t) {
//         var p = shuttlePath.node().getPointAtLength(t * shuttlePathLength + percentComplete * shuttlePathLength);
//         sTrain.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker
//         // return i(t);
//         // if (t >= 1 - percentComplete) {
//         //   setTimeout(function(){ d3.select('#marker').style('opacity', '0'); },0);
//         // }
//       }
//     }
//     setTimeout(function() { svg.select('path.shuttlePath').call(transition) },timeUntilDeparture)
//   }
