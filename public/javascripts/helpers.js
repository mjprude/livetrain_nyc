// **************************** HANDLE USER MAP MOVEMENTS *******************************
// Use to keep the full map in view
function anchorMapOverlay(){
  var mapAnchorPoints = getBounds();
  // Get map pixel size
  var mapSize = map.getSize();
  var mapWidth = mapSize.x;
  var mapHeight = mapSize.y;

  // Translate the svg to deal with map dragging
  // svg.attr('x', function(){ return applyLatLngToLayer(largeSVGAnchorCoordinates).x })
  //   .attr('y', function(){ return applyLatLngToLayer(largeSVGAnchorCoordinates).y });

  svg.attr('x', 0)
      .attr('y', 0)
      .attr('width', mapWidth)
      .attr('height', mapHeight)
      .style('-webkit-transform', function(){
        return 'translate3d(' + mapAnchorPoints.x + 'px,' + mapAnchorPoints.y + "px, 0px)";
      })
      .style('-ms-transform', function(){
        return 'translate3d(' + mapAnchorPoints.x + 'px,' + mapAnchorPoints.y + "px, 0px)";
      })
      .style('-o-transform', function(){
        return 'translate3d(' + mapAnchorPoints.x + 'px,' + mapAnchorPoints.y + "px, 0px)";
      })
      .style('transform', function(){
        return 'translate3d(' + mapAnchorPoints.x + 'px,' + mapAnchorPoints.y + "px, 0px)";
      });

  // "Untranslate" the group that holds the stop coordinates and path
  staticGroup.style('-webkit-transform', function(){
                return 'translate3d(' + -mapAnchorPoints.x + 'px,' + -mapAnchorPoints.y + "px, 0px)";
              })
              .style('-ms-transform', function(){
                return 'translate3d(' + -mapAnchorPoints.x + 'px,' + -mapAnchorPoints.y + "px, 0px)";
              })
              .style('-o-transform', function(){
                return 'translate3d(' + -mapAnchorPoints.x + 'px,' + -mapAnchorPoints.y + "px, 0px)";
              })
              .style('transform', function(){
                return 'translate3d(' + -mapAnchorPoints.x + 'px,' + -mapAnchorPoints.y + "px, 0px)";
              });

  dynamicGroup.style('-webkit-transform', function(){
                return 'translate3d(' + -mapAnchorPoints.x + 'px,' + -mapAnchorPoints.y + "px, 0px)";
              })
              .style('-ms-transform', function(){
                return 'translate3d(' + -mapAnchorPoints.x + 'px,' + -mapAnchorPoints.y + "px, 0px)";
              })
              .style('-o-transform', function(){
                return 'translate3d(' + -mapAnchorPoints.x + 'px,' + -mapAnchorPoints.y + "px, 0px)";
              })
              .style('transform', function(){
                return 'translate3d(' + -mapAnchorPoints.x + 'px,' + -mapAnchorPoints.y + "px, 0px)";
            });                
}

// Handle path and marker positions on all mouse events 
function positionReset() {

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

//(Handle marker and path pixel resizing on user map zoom)
function zoomReset() {
  var currentZoom = map.getZoom();

  var trainLabels = d3.selectAll('.trainLabels')
  if (currentZoom < 14) {
    trainLabels.classed('invisible', true);
  } else {
    trainLabels.classed('invisible', false);
  }

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
              .attr('r', trainZoomScale(currentZoom));
  dynamicGroup.selectAll('.trainLabels')
              .attr('font-size', trainLabelZoomScale(currentZoom));              

  // Resize lines
  staticGroup.selectAll('.routePath')
              .attr('stroke-width', routePathZoomScale(currentZoom));

  dynamicGroup.selectAll('.rails')
              .attr('stroke-width', routePathZoomScale(currentZoom));           
}

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

// ******************* Countdown clock functions *************************
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
  hideStationTooltip();
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
        this.lastElementChild.innerHTML = newTime;
      } else {
        this.remove();
      };
    });
  }
}

// ******************* Train info functions *************************

function convertStopIdToStationName(stop_id) {
  var stationName = null;
  var i = 0;
  while (i < routeData.stops.length && !stationName) {
    if (stop_id === routeData.stops[i].stop_id) {
      stationName = routeData.stops[i].stop_name;
    }
    i++;
  }

  return stationName ? stationName : 'missing station info' ;
}

function convertUTCTimestamp(timestamp) {
  return new Date(timestamp*1000).toLocaleTimeString();
}

function fetchTrainInfo(d){
  trainInfo.fetch({
    data: {train_id: d.trip_id}
  });
  showTrainInfo();
}

function showTrainInfo(){
  d3.select('#train-info-container').classed('hidden', false)
                                .transition()
                                .duration(250)
                                .style('opacity', 1);
  trainInfoShowing = true;
}

function hideTrainInfo(){
  d3.select('#train-info-container').transition()
                                .duration(250)
                                .style('opacity', function(){
                                  setTimeout(function(){
                                    d3.select('#train-info-container').classed('hidden', true);
                                  }, 250);
                                  return 0;
                                }); 
  trainInfoShowing = false;
}

// ***************** Line Control ********************
function lineControl(){
  var route = this.dataset.route;
  var button = d3.select(this);
  if (route === 'All') {
    var trains = d3.selectAll('.trains');
    var trainLabels = d3.selectAll('.trainLabels');
    if (button.classed('selected') ) {
      d3.selectAll('.line-selector').classed('selected', false);
      toggleTrains(trains, trainLabels, true);
    } else {
      d3.selectAll('.line-selector').classed('selected', true);
      toggleTrains(trains, trainLabels, false);
    }
  } else {
    var trains = d3.selectAll('.route-' + route);
    var trainLabels = d3.selectAll('.trainLabel-' + route);
    if (button.classed('selected')) {
      button.classed('selected', false);
      toggleTrains(trains, trainLabels, true);
    } else {
      button.classed('selected', true);
      toggleTrains(trains, trainLabels, false);
    }
  }
  updateSelectedRoutes();
}

function updateSelectedRoutes(){
  selectedRoutes = [];
  $('.line-selector').each(function(idx, el){
    if (d3.select(el).classed('selected')) {
      selectedRoutes.push(el.dataset.route)
    }
  });
}

function toggleTrains(trains, trainLabels, boolean) {
  trains.classed('hidden', boolean);
  trainLabels.classed('hidden', boolean);
}