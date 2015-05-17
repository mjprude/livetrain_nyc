'use strict';

var d3, L, $;

var countingDown = false;
var trainInfoShowing = false;
var selectedRoutes = [];


// map-config
var startingZoom = 12;
var maxZoom = 19;
var minZoom = 11;
var northEastBounds = L.latLng(40.99803873280107, -73.40652465820311);
var southWestBounds = L.latLng(40.493437209343654, -74.39529418945312);
var largeSVGAnchorCoordinates = [-74.39529418945312, 40.96227093228072];
var maxBounds = L.latLngBounds(southWestBounds, northEastBounds);
var routeData;

L.mapbox.accessToken = 'pk.eyJ1IjoibWpwcnVkZSIsImEiOiJiVG8yR2VrIn0.jtdF6eqGIKKs0To4p0mu0Q';
var map = L.mapbox.map('map', 'mjprude.l44chham', {
        maxZoom: maxZoom,
        minZoom: minZoom,
        maxBounds: maxBounds,
        zoomControl: false,
    })
    .setView([40.75583970971843, -73.90090942382812], startingZoom);
new L.Control.Zoom({
    position: 'bottomleft'
}).addTo(map);

// function geoLocate() {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(function(pos) {
//       // startingZoom = 15
//       return [pos.coords.latitude, pos.coords.longitude]
//     });
//   } else {
//     return [ 40.75583970971843, -73.90090942382812 ]
//   }
// }

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
var svg = d3.select(map.getPanes().markerPane).append('svg');

// The "g" elements to which we append things
var staticGroup = svg.append('g').attr('class', 'leaflet-zoom-hide');
var dynamicGroup = svg.append('g').attr('class', 'leaflet-zoom-hide');
// Append current (invisible) train paths
var railsGroup = dynamicGroup.append('g')
    .attr('class', 'railsGroup');
// var trainsGroup = dynamicGroup.append('g')
//                           .attr('class', 'trainsGroup');                               

// ******************* SCALES AND SUCH ******************************
var stopZoomScale = d3.scale.linear()
    .domain([minZoom, maxZoom])
    .range([2, 10]);

var stopStrokeZoomScale = d3.scale.linear()
    .domain([minZoom, maxZoom])
    .range([1, 3]);

var padZoomScale = d3.scale.linear()
    .domain([minZoom, maxZoom])
    .range([6, 26]);

var trainZoomScale = d3.scale.linear()
    .domain([minZoom, maxZoom])
    .range([2, 12]);

var routePathZoomScale = d3.scale.linear()
    .domain([minZoom, maxZoom])
    .range([2, 12]);

var routeOutlineZoomScale = d3.scale.linear()
    .domain([minZoom, maxZoom])
    .range([4, 14]);

var trainLabelZoomScale = d3.scale.linear()
    .domain([minZoom, maxZoom])
    .range([4, 14]);

// Event listeners for all user map movements
map.on('viewreset', positionReset);
map.on('resize', positionReset);
map.on('move', positionReset);
map.on('swipe', positionReset);

// Event listener for zoom event
map.on('viewreset', zoomReset);

// ********************** LOAD JSON - STATIC DATA (STOPS AND LINES) ********************
d3.json('/new_irt_routes_stops_with_l_and_gs.json', function(json) {
    routeData = json;

    // Add routes to map
    var routes = json.routes;
    var routeGroup = staticGroup.append('g')
        .attr('class', 'routeGroup');

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
        .attr('class', 'stopGroup');

    var stops = json.stops;
    stopGroup.selectAll('.stops')
        .data(stops)
        .enter()
        .append('circle')
        .attr('r', stopZoomScale(startingZoom))
        .attr('id', function(d) {
            return d.stop_id;
        })
        .attr('class', 'stops')
        .attr('stroke', function(d) {
            return d.colors[0];
        })
        .attr('stroke-width', stopStrokeZoomScale(startingZoom));

    // ...and the overlays necessary for the semi-circle effect
    stopGroup.selectAll('.stopOverlays')
        .data(stops)
        .enter()
        .append('circle')
        .attr('r', stopZoomScale(startingZoom))
        .attr('class', 'stopOverlays')
        .attr('stroke', function(d) {
            if (d.colors.length > 1) {
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
}); // end of static JSON call


// Remember, arrivals are in the db as s, current time is ms
function percentComplete(departure, arrival) {
    var totalTime = (arrival - departure);
    var currentTime = new Date().getTime();
    return (1 - ((arrival * 1000) - currentTime) / (totalTime * 1000));
}

function tweenTrain(path, percentComplete) {
    return function(t) {
      var p;
      try {
        p = path.node().getPointAtLength(t * (path.node().getTotalLength() * (1 - percentComplete)) + (percentComplete * (path.node().getTotalLength())));
      } catch(err) {
        debugger;
      }
        return 'translate(' + p.x + ',' + p.y + ')';
    };
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
    return (now > (d.departure1 * 1000)) ? (now - (d.departure1 * 1000)) : 0;
}

function holdTimeTwo(d) {
    var now = new Date().getTime();
    return (now > (d.departure2 * 1000)) ? (now - (d.departure2 * 1000)) : 0;
}

function holdTrain(path) {
    return function() {
      var startPoint;
        try {
          startPoint = path.node().getPointAtLength(0);
        } catch(err) {
          debugger;
        }
        return 'translate(' + startPoint.x + ',' + startPoint.y + ')';
    };
}




// //////////////  ANIMATION \\\\\\\\\\\\\\\\ \\
function animate(data) {

    var firstRails = railsGroup.selectAll('.firstRails')
        .data(data, function(d) {
            return d.trip_id;
        });

    firstRails.enter()
        .append('path')
        .attr('class', 'firstRails rails')
        .attr('id', function(d) {
            return 'firstRail-' + d.trip_id;
        });


    var secondRails = railsGroup.selectAll('.secondRails')
        .data(data, function(d) {
            return d.trip_id;
        });

    secondRails.enter()
        .append('path')
        .attr('class', 'secondRails rails')
        .attr('id', function(d) {
            return 'secondRail-' + d.trip_id;
        });

    // Draw new trains
    var trains = dynamicGroup.selectAll('.trainGroups')
        .data(data, function(d) {
            return d.trip_id;
        });

    var numEntering = trains.enter()[0].length;
    var numExiting = trains.exit()[0].length;

    trains.exit().remove();

    var enteringTrains = trains.enter()
        .append('g')
        .attr('class', 'trainGroups')
        .classed('hidden', function(d) {
            return selectedRoutes.indexOf(d.route.replace('X', '').replace('GS', 'S')) < 0 ? true : false;
        })
        .classed('faded', function() {
            return trainInfoShowing;
        })
        .on('click', fetchTrainInfo);

    enteringTrains.append('circle')
        .attr('class', function(d) {
            return 'trains route-' + d.route.replace('X', '').replace('GS', 'S') + ' ' + (d.direction === 'N' ? 'northbound' : 'southbound');
        })
        .attr('r', trainZoomScale(startingZoom))
        .attr('id', function(d) {
            return 'train-' + d.trip_id;
        });

    enteringTrains.append('text')
        .attr('class', function(d) {
            return 'trainLabels trainLabel-' + d.route.replace('X', '').replace('GS', 'S') + ' ' + (d.direction === 'N' ? 'northbound' : 'southbound');
        })
        .attr('id', function(d) {
            return 'trainLabel-' + d.trip_id;
        })
        .attr('y', 2)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('font-size', function() {
            return trainLabelZoomScale(startingZoom);
        })
        .text(function(d) {
            return d.route.replace('X', '').replace('GS', 'S');
        });

    secondRails.exit()
        .remove();

    firstRails.exit()
        .remove();

    positionReset();
    zoomReset();

    // Animate all the trains
    // look at duration on line 298, is this right?
    var trainsAnimated = 0;
    var singlePaths = 0;
    var doublePaths = 0;

    trains.filter(function(d){
          if (d.path2) {
            doublePaths += 1
            return true;
          } else {
            return false;
          }
          // return d.path2 ? true : false;
        })
        .transition()
        .duration(function(d) {
            trainsAnimated += 1;
            return holdTime(d);
        })
        .attrTween('transform', function(d) {
            var path = d3.select('#firstRail-' + d.trip_id);
            return holdTrain(path, trip_id);
        })
        .transition()
        .duration(function(d) {
            return duration(d);
        })
        .ease('linear')
        .attrTween('transform', function(d) {
            var path = d3.select('#firstRail-' + d.trip_id);
            return tweenTrain(path, percentComplete(d.lastDeparture, d.arrival1));
        })
        .transition()
        .duration(function(d) {
            return holdTimeTwo(d);
        })
        .attrTween('transform', function(d) {
            var path = d3.select('#secondRail-' + d.trip_id);
            return holdTrain(path);
        })
        .transition()
        .duration(function(d) {
            return durationTwo(d);
        })
        .ease('linear')
        .attrTween('transform', function(d) {
            var path = d3.select('#secondRail-' + d.trip_id);
            return tweenTrain(path, 0);
        });

    //animate trains with a single path
    trains.filter(function(d){
          if (d.path2) {
            return false;
          } else {
            singlePaths += 1;
            return true;
          }
          // return d.path2 ? false : true;
        })
        .transition()
        .duration(function(d) {
            trainsAnimated += 1;
            return holdTime(d);
        })
        .attrTween('transform', function(d) {
            var path = d3.select('#firstRail-' + d.trip_id);
            return holdTrain(path);
        })
        .transition()
        .duration(function(d) {
            return duration(d);
        })
        .ease('linear')
        .attrTween('transform', function(d) {
            var path = d3.select('#firstRail-' + d.trip_id);
            return tweenTrain(path, percentComplete(d.lastDeparture, d.arrival1));
        })
        .transition()
        .duration(5000)
        .style('opacity', 0);

    checkNumTrains({
        jsonCount: data.length,
        trainCount: trains[0].length,
        numExiting: numExiting,
        numEntering: numEntering,
        trainsAnimated: trainsAnimated,
        singlePaths: singlePaths,
        doublePaths: doublePaths
    });
}

//// Debugger functions
function checkNumTrains(options) {
    console.dir(options);
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
        el: '#countdown-info'
    });

    d3.select('#station-countdown-header').on('click', hideCountdownClock);

    trainInfo = new TrainInfo();
    trainInfoView = new TrainInfoView({
        model: trainInfo,
        el: '#train-info'
    });

    d3.select('#train-info-header').on('click', hideTrainInfo);

    d3.select('#about-button').on('click', function() {
        d3.select('#about-section-container').classed('hidden', false);
    });

    d3.selectAll('.line-selector').on('click', lineControl);

    d3.select('#about-section-header').on('click', function() {
        d3.select('#about-section-container').classed('hidden', true);
    });

    update();
    setInterval(function() {
        update();
    }, 60000);
});