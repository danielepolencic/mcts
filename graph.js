const generateGraph = (tree) => {
  return function getNode (rootId) {
    const root = tree[rootId];
    if (root.children.length === 0) return root;
    return Object.assign({}, root, {children: root.children.map(getNode)});
  }
}

// ************** Generate the tree diagram  *****************
var margin = {top: 20, right: 120, bottom: 20, left: 120},
  width = 900 - margin.right - margin.left,
  height = 400 - margin.top - margin.bottom;

var i = 0;

var treeGraph = d3.layout.tree()
  .size([height, width]);

var diagonal = d3.svg.diagonal()
  .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function update(source) {

  // Compute the new tree layout.
  var nodes = treeGraph.nodes(source).reverse(),
    links = treeGraph.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Declare the nodesâ€¦
  var node = svg.selectAll("g.node")
    .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter the nodes.
  var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { 
      return "translate(" + d.y + "," + d.x + ")"; });

  nodeEnter.append("circle")
    .attr("r", 10)
    .style("fill", "#fff");

  nodeEnter.append("text")
    .attr("x", function(d) { 
      return d.children || d._children ? -13 : 13; })
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) { 
      return d.children || d._children ? "end" : "start"; })
    .text(function(d) { return `${d.lastMove} ${d.lastMove === 'player' ? d.player : d.ghost} ${d.score}`; })
    .style("fill-opacity", 1);

  // Declare the linksâ€¦
  var link = svg.selectAll("path.link")
    .data(links, function(d) { return d.target.id; });

  // Enter the links.
  link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", diagonal);

}
