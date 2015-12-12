const d3 = require('d3');

module.exports = {generate, create, destroy, update};

function generate (simulationState) {
  return (function getNode (simulationState) {
    const childNodes = simulationState.getChildNodes();
    if (childNodes.length === 0) return simulationState.dump();
    return Object.assign({}, simulationState.dump(), {
      children: childNodes.map((child) => simulationState.setCurrentNode(child.id)).map(getNode)
    });
  })(simulationState.setCurrentNode(0));
}

// ************** Generate the tree diagram  *****************
var margin = {top: 50, right: 120, bottom: 20, left: 120},
  width = 1000 - margin.right - margin.left,
  height = 1000 - margin.top - margin.bottom;

var treeGraph = d3.layout.tree()
  .size([width, height]);

var diagonal = d3.svg.diagonal()
  .projection((node) => [node.x, node.y]);

function create () {
  d3.select('body').append('svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'graph');
}

function destroy () {
  d3.select('svg').remove();
}

const isGhost = (node) => node.lastMove === 'ghost';

function update(source) {

  // Compute the new tree layout.
  let nodes = treeGraph.nodes(source).reverse();
  let links = treeGraph.links(nodes);

  nodes.forEach((node) => node.y = node.depth * 180);

  var node = d3.select('.graph').selectAll('g.node').data(nodes, (node) => node.id);

  // Enter the nodes.
  var nodeEnter = node.enter().append('g')
    .attr('class', 'node')
    .attr('transform', (node) => `translate(${node.x},${node.y})`);

  nodeEnter.append('circle')
    .attr('r', 30)
    // ghost red, player blue
    .style('fill', (node) => '#67a9cf');

  const text = nodeEnter.append('text')
    .attr('transform', `translate(0, -5)`);

  text.append('tspan')
    .attr('class', 'score')
    .attr('x', 0)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    // .text((node) => `${node.score.hero | 0}/${node.count.hero | 0} - ${node.score.ghost | 0}/${node.count.ghost | 0}`);

  text.append('tspan')
    .attr('class', 'position')
    .attr('x', 0)
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    // .text((node) => `${node.gameState.get('hero', 'x')},${node.gameState.get('hero', 'y')} - ${node.gameState.get('ghost', 'x')},${node.gameState.get('ghost', 'y')}`);

  // text.append('tspan')
  //   .attr('class', 'antagonist')
  //   .attr('x', 0)
  //   .attr('y', 30)
  //   .attr('text-anchor', 'middle');
    // .text((node) => (isGhost(node) ? node.player : node.ghost).join(':'))

  // Declare the linksâ€¦
  var link = d3.select('.graph').selectAll('path.link')
    .data(links, (node) => node.target.id);

  // Enter the links.
  link.enter().insert('path', 'g')
    .attr('class', 'link')
    .attr('d', diagonal);

}
