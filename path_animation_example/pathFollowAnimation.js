var percentComplete = 0.5
queue()
.defer(d3.xml, "wiggle.svg", "image/svg+xml")
.await(ready);

function ready(error, xml) {

  //Adding our svg file to HTML document
  var importedNode = document.importNode(xml.documentElement, true);
  d3.select("#pathAnimation").node().appendChild(importedNode);

  var svg = d3.select("svg");

  var path = svg.select("path#wiggle").call(transition);
  var startPoint = pathStartPoint(path);

  var marker = svg.append("circle");
  marker.attr("r", 7)
    .attr("id", "marker")
    .attr("transform", "translate(" + startPoint + ")");

  //Get path start point for placing marker
  function pathStartPoint(path) {
    // var d = path.attr("d"),
    // dsplitted = d.split(" ");
    // debugger
    // return dsplitted[1];
    var l = path.node().getTotalLength();
    var point = path.node().getPointAtLength(l * percentComplete);

    return point.x + ',' + point.y
  }

  function transition(path) {
    path.transition()
        .duration(7500 / percentComplete)
        .attrTween('stroke-dasharray', tweenDash)
        
  }

  function tweenDash() {
    var l = path.node().getTotalLength();
    var i = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr

    return function(t) {
      var marker = d3.select("#marker");
      var p = path.node().getPointAtLength(t * l);
      var p = path.node().getPointAtLength(t * l + l * percentComplete);

      // marker.attr("transform", "translate(300, 100)");
// debugger
      marker.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker
      // () console.log(t)
      return i(t);
    }
  }
}
