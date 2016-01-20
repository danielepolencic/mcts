const d3 = require('d3');

module.exports = {generate, create, destroy, update};

function generate (simulationState) {
  return (function getNode (currentNodeId) {
    const currentNode = simulationState.nodes.get(currentNodeId);
    const {children} = currentNode;
    if (children.size === 0) return Object.assign({}, currentNode.toJS(), {id: currentNodeId});

    return Object.assign({}, currentNode.toJS(), {
      _children: children.map(getNode).toJS(),
      children: null,
      id: currentNodeId
    });
  })(0);
}

// ************** Generate the tree diagram  *****************
var margin = {top: 50, right: 120, bottom: 20, left: 120},
  width = 800 - margin.right - margin.left,
  height = 600 - margin.top - margin.bottom;

var treeGraph = d3.layout.tree()
  .size([width, height]);

var diagonal = d3.svg.diagonal()
  .projection((node) => [node.x, node.y]);

var zoom = (container) => d3.behavior.zoom()
  .scaleExtent([1, 10])
  .on('zoom', () => {container.select('g.graph').attr('transform', `translate(${d3.event.translate.join(', ')})`)});

function create () {
  const svg = d3.select('body').append('svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom);

  var rect = svg.append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .call(zoom(svg));

  svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'graph');
}

function destroy () {
  d3.select('svg').remove();
}

function update (source, root = {x0: 0, y0: 0}) {

  // Compute the new tree layout.
  let nodes = treeGraph.nodes(source).reverse();
  let links = treeGraph.links(nodes);

  nodes.forEach((node) => node.y = node.depth * 180);

  var node = d3.select('.graph')
    .selectAll('g.node')
    .data(nodes, (node) => node.id);

  // Enter the nodes.
  var nodeEnter = node.enter().append('g')
    .attr('class', 'node')
    .attr('transform', (node) => `translate(${root.x}, ${root.y})`)
    .on('click', (node) => {
      if (node.children) {
        node._children = node.children;
        node.children = null;
      } else {
        node.children = node._children;
        node._children = null;
      }
      update(source, node);
    });

  var nodeUpdate = node.transition()
      .duration(500)
      .attr('transform', (node) => `translate(${node.x}, ${node.y})`);

  var nodeExit = node.exit().transition()
      .duration(500)
      .attr('transform', (node) => `translate(${root.x}, ${root.y})`)
      .remove();

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
    .text((node) => `${node.score.hero | 0}/${node.count.hero | 0} - ${node.score.ghost | 0}/${node.count.ghost | 0}`);

  text.append('tspan')
    .attr('class', 'position')
    .attr('x', 0)
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .text((node) => `${node.gameState.get('hero', 'x')},${node.gameState.get('hero', 'y')} - ${node.gameState.get('ghost', 'x')},${node.gameState.get('ghost', 'y')}`);

  var link = d3.select('.graph').selectAll('path.link')
    .data(links, (node) => node.target.id);

  link.enter().insert('path', 'g')
    .attr('class', 'link')
    .attr('d', () => {
      const origin = {x: root.x0, y: root.y0};
      return diagonal({source: origin, target: origin});
    });

  link.transition()
    .duration(500)
    .attr('d', diagonal);

  link.exit().transition()
    .duration(500)
    .attr('d', () => {
      const origin = {x: source.x, y: source.y};
      return diagonal({source: origin, target: origin});
    })
    .remove();

  nodes.forEach((node) => {
    node.x0 = node.x;
    node.y0 = node.y;
  });
}
