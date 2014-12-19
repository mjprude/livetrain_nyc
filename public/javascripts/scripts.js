var startingZoom = 12;
var maxZoom = 19;
var minZoom = 9;

L.mapbox.accessToken = 'pk.eyJ1IjoibWpwcnVkZSIsImEiOiJiVG8yR2VrIn0.jtdF6eqGIKKs0To4p0mu0Q';
var map = L.mapbox.map('map', 'mjprude.kcf5kl75', {
              maxZoom: maxZoom,
              minZoom: minZoom,
            })
            .setView([ 40.75583970971843, -73.90090942382812 ], startingZoom);

// ******************* SVG OVERLAY GENERATION ***********************
var svg = d3.select(map.getPanes().markerPane).append("svg");
// The "g" elements to which we append things
var staticGroup = svg.append("g").attr("class", "leaflet-zoom-hide");
var dynamicGroup = svg.append("g").attr("class", "leaflet-zoom-hide");
// Append current (invisible) train paths
var railsGroup = dynamicGroup.append('g')
                               .attr('class', 'railsGroup');
var trainsGroup = dynamicGroup.append('g')
                          .attr('class', 'trainsGroup');                               

// ******************* SCALES AND SUCH ******************************
var stopZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([2, 10]);                             

var stopStrokeZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([ 1, 3]);

var trainZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([1, 6]);                              

var routePathZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([1, 6]);


// ******************* Projection functions *************************
// Line projection
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

function update() {
  $.ajax({
    url: 'http://localhost:9292/api/updates',
    dataType: 'JSON',
    success: animate
  });
}
// **************************** HANDLE USER MAP MOVEMENTS *******************************
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
    dynamicGroup.style('transform', function(){
      return 'translate3d(' + -mapAnchorPoints.x + 'px,' + -mapAnchorPoints.y + "px, 0px)";
    });
  }

  // Update STATIC routePaths
  d3.selectAll('.routePath').attr('d', function(d){ 
    return toLine(d.path_coordinates); 
  });
  
  // Update DYNAMIC Rail paths
  d3.selectAll('.firstRails').attr('d', function(d){
    return toLine(d.path1)
  });
  d3.selectAll('.secondRails').attr('d', function(d){
    if (d.path2) {
      return toLine(d.path2);
    }
  });


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


//(Handle marker and path pixel resizing on user map zoom)
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
  dynamicGroup.selectAll('.trains')
              .attr('r', trainZoomScale(currentZoom));

  // Resize lines
  staticGroup.selectAll('.routePath')
              .attr('stroke-width', routePathZoomScale(currentZoom));

  dynamicGroup.selectAll('.rails')
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

  routeGroup.selectAll('.routePath')
            .data(routes)
            .enter()
            .append('path')
            .attr('class', 'routePath')
            .attr('stroke-width', routePathZoomScale(startingZoom))

  // Add Stops to map
  var stopGroup = staticGroup.append('g')
              .attr('class', 'stopGroup')

  var stops = json.stops;
  stopGroup.selectAll('.stops')
            .data(stops)
            .enter()
            .append('circle')
            .attr('r', stopZoomScale(startingZoom))
            .attr('id', function(d){ return d.stop_id; })
            .attr('class', 'stops')
            .attr('stroke', function(d){ return 'rgb' + d.colors[0]; })
            .attr('stroke-width', stopStrokeZoomScale(startingZoom));

  // ...and the overlays necessary for the semi-circle effect
  stopGroup.selectAll('.stopOverlays')
            .data(stops)
            .enter()
            .append('circle')
            .attr('r', stopZoomScale(startingZoom))
            .attr('class', 'stopOverlays')
            .attr('stroke', function(d) {
              if (d.colors.length > 1){
                return 'rgb' + d.colors[1];
              } else {
                return 'rgb' + d.colors[0];
              }
            })
            .attr('stroke-width', stopStrokeZoomScale(startingZoom));

  // call positionReset and zoomReset to populate the stops and lines and such...
  positionReset();
  zoomReset();
});// end of static JSON call



// //////////////  ANIMATION FOR REAL \\\\\\\\\\\\\\\\ \\
function animate(data) {
  console.dir(data);

  var firstRails = railsGroup.selectAll('.firstRails')
                             .data(data, function(d){ return d.trip_id; });

  firstRails.enter()
            .append('path')
            .attr('class', 'firstRails rails')
            .attr('id', function(d){ return 'firstRail-' + d.trip_id });

  // exit stuff TBD
  firstRails.exit()
            .transition()
            .duration(5000)
            .remove();


  var secondRails = railsGroup.selectAll('.secondRails')
                             .data(data, function(d){ return d.trip_id; });

  secondRails.enter()
            .append('path')
            .attr('class', 'secondRails rails')
            .attr('id', function(d){ return 'secondRail-' + d.trip_id });

  secondRails.exit()
            .transition()
            .duration(5000)
            .remove();

  // Draw new trains
  var trains = trainsGroup.selectAll('.trains')
                          .data(data, function(d){ return d.trip_id; });
  
  trains.enter()
        .append('circle')
        .attr('class', function(d){ return 'trains route-' + d.route })
        .attr('r', trainZoomScale(startingZoom))
        .attr('id', function(d){ return 'train-' + d.trip_id; });

  trains.exit()
        .transition()
        .duration(5000)
        .attr('opacity', 0)
        .remove();

  // Remember, arrivals are in the db as s, current time is ms
  function percentComplete(departure, arrival) {
    totalTime = (arrival - departure);
    currentTime = new Date().getTime();
    return (1 - ( (arrival * 1000) - currentTime) / (totalTime * 1000) );
  }
  
  positionReset();
  zoomReset();

  // Animate all the trains
  trains.transition()
        .duration(function(d){ return holdTime(d); })
        .attrTween('transform', function(d){
          var path = d3.select('#firstRail-' + d.trip_id);
          return holdTrain(path);
        })
        .transition()
        .duration(function(d){ return duration(d) })
        .ease('linear')
        .attrTween('transform', function(d){
          var path = d3.select('#firstRail-' + d.trip_id);
          return tweenTrain(path, percentComplete(d.lastDeparture, d.arrival1));
        })
        .transition()
        .duration(function(d){ 
          if (d.path2) {
            return 0;
          } else {
            return 5000;
          }
        })
        .style('opacity', function(d){ 
          if (d.path2) {
            return 1;
          } else {
            return 0;
          }
        })
        .transition()
        .duration(function(d){ return holdTime(d); })
        .attrTween('transform', function(d){
          if (d.path2) {
            var path = d3.select('#secondRail-' + d.trip_id);
            return holdTrain(path);
          }
        })
        .transition()
        .duration(function(d){ return durationTwo(d) })
        .ease('linear')
        .attrTween('transform', function(d){
          if (d.path2) {
            var path = d3.select('#secondRail-' + d.trip_id);
            return tweenTrain(path, 0)
          }
        })



  function tweenTrain(path, percentComplete) {
    return function(t) {  
      var p = path.node().getPointAtLength(t * (path.node().getTotalLength() * (1 - percentComplete) ) + (percentComplete * (path.node().getTotalLength()) ) );
      return 'translate(' + p.x + ',' + p.y + ')';
    }
  }

  function duration(d) {
    var now = new Date().getTime();
    return ((d.arrival1 * 1000) - now);
  }

  function durationTwo(d) {
    var now = new Date().getTime();
    return ((d.arrival2 * 1000) - now);
  }

  function holdTime(d) {
    var now = new Date().getTime();
    return (now > d.departure1) ? (now - (d.departure1 * 1000)) : 0; 
  }

  function holdTimeTwo(d) {
    var now = new Date().getTime();
    return (now > d.departure2) ? (now - (d.departure2 * 1000)) : 0;
  }

  function holdTrain(path) {
    return function(t) {
      var startPoint = path.node().getPointAtLength(0);
      return 'translate(' + startPoint.x + ',' + startPoint.y + ')';
    }
  }

  positionReset();

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


// ************************ ANIMATION 2 **************************************
// function animateSingle(){
//   var trains = staticGroup.selectAll('trains')
//                           .data(fakeJSON, function(d){ return d.trainId; })
  
//   // Append current (invisible) train paths
//   // YOUR CODE HERE


//   // Draw new trains
//   trains.enter()
//     .append('circle')
//     .attr('class', 'trains')
//     .attr('r', 5)
//     .attr('id', function(d){ return 'train-' + d.trainId;})
//     .style('fill', 'blue')
//     .attr("transform", function(d) { return "translate(" + getStartPointOne(d).x+"," + getStartPointOne(d).y + ")" });

//   function getStartPointOne(d){
//     var path = d3.select('#' + d.tripOne.path);
//     return path.node().getPointAtLength(path.node().getTotalLength() * d.tripOne.percentComplete);
//   }
  
//   // Animate all the trains
//   trains.transition()
//         .duration(function(d){ return d.tripOne.timeUntilDeparture; })
//         .attrTween('transform', function(d){
//           var path = d3.select('#' + d.tripOne.path);
//           return holdTrain(path);
//         })
//         .transition()
//         .duration(function(d){ return d.tripOne.duration })
//         .ease('linear')
//         .attrTween('transform', function(d){
//           var path = d3.select('#' + d.tripOne.path);
//           return tweenTrain(path, d.tripOne.percentComplete);
//         })
//         .transition()
//         .duration(function(d){ return d.tripTwo.timeUntilDeparture; })
//         .attrTween('transform', function(d){
//           var path = d3.select('#' + d.tripTwo.path);
//           return holdTrain(path);
//         })
//         .transition()
//         .duration(function(d){ return d.tripTwo.duration})
//         .ease('linear')
//         .attrTween('transform', function(d){
//           var path = d3.select('#' + d.tripTwo.path);
//           return tweenTrain(path, d.tripTwo.percentComplete);
//         });

//   function tweenTrain(path, percentComplete) {
//     return function(t) {
//       var p = path.node().getPointAtLength(t * (path.node().getTotalLength() * (1 - percentComplete) ) + (percentComplete * (path.node().getTotalLength()) ) );
//       return 'translate(' + p.x + ',' + p.y + ')';
//     }
//   }

//   function holdTrain(path) {
//     return function(t) {
//       var startPoint = path.node().getPointAtLength(0);
//       return 'translate(' + startPoint.x + ',' + startPoint.y + ')';
//     }
//   }
// }

// ********************* ANIMATION 1 **************
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
