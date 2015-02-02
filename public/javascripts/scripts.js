var countingDown = false;
var trainInfoShowing = false;
var selectedRoutes = [];

// map-config
var startingZoom = 11;
var maxZoom = 19;
var minZoom = 11;
var northEastBounds = L.latLng(40.99803873280107, -73.40652465820311);
var southWestBounds = L.latLng(40.493437209343654, -74.39529418945312);
var largeSVGAnchorCoordinates = [-74.39529418945312 , 40.96227093228072];
var maxBounds = L.latLngBounds(southWestBounds, northEastBounds);
var routeData;

L.mapbox.accessToken = 'pk.eyJ1IjoibWpwcnVkZSIsImEiOiJiVG8yR2VrIn0.jtdF6eqGIKKs0To4p0mu0Q';
var map = L.mapbox.map('map', 'mjprude.kcf5kl75', {
              maxZoom: maxZoom,
              minZoom: minZoom,
              maxBounds: maxBounds,
              zoomControl: false,
            })
            .setView([ 40.75583970971843, -73.90090942382812 ], startingZoom);
new L.Control.Zoom({ position: 'bottomleft' }).addTo(map);

function update() {
  $.ajax({
    url: 'http://104.131.206.60/api/update',
    // url: 'http://localhost:3000/api/update',
    dataType: 'JSON',
    success: animate
  });
}

var stationCountdown;
var stationCountdownView;
var trainInfo;
var trainInfoView;

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
                              .range([2, 12]);                              

var routePathZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([2, 12]);

var routeOutlineZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([4, 14]);                              

var trainLabelZoomScale = d3.scale.linear()
                              .domain([ minZoom, maxZoom])
                              .range([4, 14]);

// Event listeners for all user map movements
map.on('viewreset', positionReset);
map.on('resize', positionReset);
map.on('move', positionReset);
map.on('swipe', positionReset);

// Event listener for zoom event
map.on('viewreset', zoomReset)

// ********************** LOAD JSON - STATIC DATA (STOPS AND LINES) ********************
d3.json("/new_irt_routes_stops_with_l_and_gs.json", function (json) {
  routeData = json;

  // Add routes to map
  var routes = json.routes;
  var routeGroup = staticGroup.append('g')
              .attr('class', 'routeGroup')

  routeGroup.selectAll('.routeOutline')
            .data(routes)
            .enter()
            .append('path')
            .attr('class', 'routeOutline')
            .attr('stroke-width', routeOutlineZoomScale(startingZoom));

  routeGroup.selectAll('.routePath')
            .data(routes)
            .enter()
            .append('path')
            .attr('class', 'routePath')
            .attr('stroke-width', routePathZoomScale(startingZoom));

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
            .attr('r', padZoomScale( startingZoom ))            
            .on('mouseover', showStationTooltip )
            .on('mouseout', hideStationTooltip )
            .on('click', fetchCountdownInfo );

  // call positionReset and zoomReset to populate the stops and lines and such...
  positionReset();
  zoomReset();
});// end of static JSON call



// //////////////  ANIMATION \\\\\\\\\\\\\\\\ \\
function animate(data) {

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
        .attr('class', function(d){ return 'trains route-' + d.route.replace('X', '').replace('GS', 'S'); })
        .attr('r', trainZoomScale(startingZoom))
        .attr('id', function(d){ return 'train-' + d.trip_id; })
        .classed('hidden', function(d){
          return selectedRoutes.indexOf(d.route.replace('X', '').replace('GS', 'S')) < 0 ? true : false;
        })
        .on('click', fetchTrainInfo );

  trains.exit()
        .transition()
        .duration(5000)
        .attr('opacity', 0)
        .remove();

  // Draw train labels
  var trainLabels = trainsGroup.selectAll('.trainLabels')
                                .data(data, function(d){ return d.trip_id; });

  trainLabels.enter()
              .append('text')
              .attr('class', function(d){ return 'trainLabels trainLabel-' + d.route.replace('X', '').replace('GS', 'S'); })
              .attr('id', function(d){ return 'trainLabel-' + d.trip_id; })
              .attr('y', 2)
              .attr('text-anchor', 'middle')
              .attr('font-family', 'sans-serif')
              .attr('font-size', function(){ return trainLabelZoomScale(startingZoom) })
              .classed('hidden', function(d){
                return selectedRoutes.indexOf(d.route.replace('X', '').replace('GS', 'S')) < 0 ? true : false;
              })
              .text(function(d){ return d.route.replace('X', '').replace('GS', 'S') });

  trainLabels.exit()
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
          var label = d3.select('#trainLabel-' + d.trip_id);          
          return holdTrain(path, label);
        })
        .transition()
        .duration(function(d){ return duration(d) })
        .ease('linear')
        .attrTween('transform', function(d){
          var path = d3.select('#firstRail-' + d.trip_id);
          var label = d3.select('#trainLabel-' + d.trip_id);
          return tweenTrain(path, percentComplete(d.lastDeparture, d.arrival1), label);
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
            var label = d3.select('#trainLabel-' + d.trip_id);            
            return holdTrain(path, label);
          }
        })
        .transition()
        .duration(function(d){ return durationTwo(d) })
        .ease('linear')
        .attrTween('transform', function(d){
          if (d.path2) {
            var path = d3.select('#secondRail-' + d.trip_id);
            var label = d3.select('#trainLabel-' + d.trip_id);
            return tweenTrain(path, 0, label)
          }
        })



  function tweenTrain(path, percentComplete, label) {
    return function(t) {  
      var p = path.node().getPointAtLength(t * (path.node().getTotalLength() * (1 - percentComplete) ) + (percentComplete * (path.node().getTotalLength()) ) );
      label.attr('transform', function() { return 'translate(' + p.x + ',' + p.y + ')' } );
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

  function holdTrain(path, label) {
    return function(t) {
      var startPoint = path.node().getPointAtLength(0);
      label.attr('transform', function() { return 'translate(' + startPoint.x + ',' + startPoint.y + ')' } );
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

$(function() {
  updateSelectedRoutes();
  d3.select('#map').append('div').attr('id', 'station-tooltip').append('h3').text('Station Stuff');
  stationCountdown = new StationCountdown();
  stationCountdownView = new StationCountdownView({
    model: stationCountdown,
    el: "#countdown-info",
  });
  d3.select('#station-countdown-header').on('click', hideCountdownClock);

  trainInfo = new TrainInfo();
  trainInfoView = new TrainInfoView({
    model: trainInfo,
    el: "#train-info",
  })
  d3.select('#train-info-header').on('click', hideTrainInfo)

  d3.selectAll('.line-selector').on('click', lineControl)

  setInterval(updateCountdownTimes, 5000);

  update();
  setInterval(function(){
    update();
  },60000);
});