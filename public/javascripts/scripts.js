var countingDown = false

// map-config
var startingZoom = 12;
var maxZoom = 19;
var minZoom = 11;
var northEastBounds = L.latLng(40.99803873280107, -73.40652465820311);
var southWestBounds = L.latLng(40.493437209343654, -74.39529418945312);
var maxBounds = L.latLngBounds(southWestBounds, northEastBounds);
var routeData;

L.mapbox.accessToken = 'pk.eyJ1IjoibWpwcnVkZSIsImEiOiJiVG8yR2VrIn0.jtdF6eqGIKKs0To4p0mu0Q';
var map = L.mapbox.map('map', 'mjprude.kcf5kl75', {
              maxZoom: maxZoom,
              minZoom: minZoom,
              maxBounds: maxBounds,
            })
            .setView([ 40.75583970971843, -73.90090942382812 ], startingZoom);

var stationCountdown;
var stationCountdownView;

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
                              .range([1, 3]);

var padZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([6, 26]);                                                               

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
    url: 'http://104.131.206.60/api/update',
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
  d3.selectAll('.tooltip-pads').attr('transform', function(d){
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
  staticGroup.selectAll('.tooltip-pads')
              .attr('r', padZoomScale(currentZoom));
  dynamicGroup.selectAll('.trains')
              .attr('r', trainZoomScale(currentZoom) * 2);

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
  routeData = json;

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
            .attr('stroke', function(d){ return d.colors[0]; })
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
                return d.colors[1];
              } else {
                return d.colors[0];
              }
            })
            .attr('stroke-width', stopStrokeZoomScale(startingZoom));

  stopGroup.selectAll('.tooltip-pads')
            .data(stops)
            .enter()
            .append('circle')
            .attr('opacity', 0)
            .attr('class', 'tooltip-pads')
            .attr('r', padZoomScale(startingZoom))            
            .on('mouseover', showStationTooltip)
            .on('mouseout', hideStationTooltip)
            .on('click', fetchCountdownInfo);

  // call positionReset and zoomReset to populate the stops and lines and such...
  positionReset();
  zoomReset();
});// end of static JSON call



// //////////////  ANIMATION FOR REAL \\\\\\\\\\\\\\\\ \\
function animate(data) {
  // console.dir(data);

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
        .attr('r', trainZoomScale(startingZoom) * 2)
        .attr('id', function(d){ return 'train-' + d.trip_id; });

  trains.exit()
        .transition()
        .duration(5000)
        .attr('opacity', 0)
        .remove();

  // Remember, arrivals are in the db as s, current time is ms
  function percentComplete(departure, arrival) {
    var totalTime = (arrival - departure);
    var currentTime = new Date().getTime();
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

// ******************************* Station Tooltip *******************************
function showStationTooltip(d){                              
  d3.select('#station-tooltip').text(d.stop_name)
                               .style('left', function(){
                                  var windowWidth = window.outerWidth;
                                  var currentBounds = window.getBounds();
                                  if ( ( $(this).width() + stopApplyLatLngToLayer(d).x - window.getBounds().x ) > window.outerWidth) {
                                    console.log('This should be on the left...');
                                    return (stopApplyLatLngToLayer(d).x - window.getBounds().x - ($(this).width() + 25 ) ) + 'px';
                                  } else  {
                                    return (stopApplyLatLngToLayer(d).x - window.getBounds().x) + 10 + 'px';
                                  }
                                })
                               .style('top', function(){
                                  var windowHeight = window.outerHeight;
                                  var currentBounds = window.getBounds();
                                  if ( ( $(this).height() + stopApplyLatLngToLayer(d).y - window.getBounds().y ) > window.outerWidth) {
                                    return (stopApplyLatLngToLayer(d).y - window.getBounds().y - ($(this).height() + 30 ) ) + 'px';
                                  } else  {
                                    return (stopApplyLatLngToLayer(d).y - window.getBounds().y) + 10 + 'px';
                                  }
                                })
                               .classed('hidden', false);
}

function hideStationTooltip(d){
  d3.select('#station-tooltip').classed('hidden', true);
}

function fetchCountdownInfo(d){  
  stationCountdown.fetch({
    data: {station_id: d.stop_id}
  });
  $('#station-name').text(d.stop_name);
  showCountdownClock();
}

function showCountdownClock(){
  d3.select('#station-countdown').classed('hidden', false)
                                .transition()
                                .duration(250)
                                .style('opacity', 1);
  countingDown = true;
}

function hideCountdownClock(){
  d3.select('#station-countdown').transition()
                                .duration(250)
                                .style('opacity', function(){
                                  setTimeout(function(){
                                    d3.select('#station-countdown').classed('hidden', true);
                                  }, 250);
                                  return 0;
                                }); 
  countingDown = false;
}

function calculateMinTillTrain(timestamp) {
  var currentTime = new Date().getTime();
  return Math.floor((( (timestamp * 1000 ) - currentTime) / 60000));
}

function updateCountdownTimes(){
  if (countingDown) {
    d3.selectAll('#station-countdown li').each(function(){
      var newTime = calculateMinTillTrain(this.dataset.timestamp);
      if (newTime > -1) {
        this.lastElementChild.innerHTML = newTime + ' min';
      } else {
        this.remove();
      };
    });
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


$(function() {
  d3.select('#map').append('div').attr('id', 'station-tooltip').append('h3').text('Station Stuff');
  stationCountdown = new StationCountdown();
  stationCountdownView = new StationCountdownView({
    model: stationCountdown,
    el: "#countdown-info",
  });
  d3.select('#station-countdown-header').on('click', hideCountdownClock);

  setInterval(updateCountdownTimes, 5000);

  update();
  setInterval(function(){
    update();
  },60000);
});