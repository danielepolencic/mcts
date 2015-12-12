module.exports = (gameState) => {
  return SimulationState({
    selectedNodeId: 0,
    nodes: [createNode(0, undefined, gameState)]
  });
};

function SimulationState (simulationState) {
  return {getCurrentNode, setCurrentNode, getChildNodes, setChildNode, dump};

  function getCurrentNode () {
    return simulationState.nodes[simulationState.selectedNodeId];
  }

  function setCurrentNode (node) {
    return SimulationState({selectedNodeId: node.id, nodes: simulationState.nodes});
  }

  function getChildNodes () {
    const currentNode = simulationState.nodes[simulationState.selectedNodeId];
    return currentNode.children.map((nodeId) => {
      return simulationState.nodes[nodeId];
    });
  }

  function setChildNode (gameState) {
    const nodeId = simulationState.nodes.length;
    const node = createNode(nodeId, simulationState.selectedNodeId, gameState);
    const nodes = simulationState.nodes.concat(node);

    const pre = nodes.slice(0, simulationState.selectedNodeId);
    const post = nodes.slice(simulationState.selectedNodeId + 1);
    const currentNode = simulationState.nodes[simulationState.selectedNodeId];

    const parentNode = Object.assign({}, currentNode, {
      children: currentNode.children.concat(nodeId)
    });

    return SimulationState({
      selectedNodeId: simulationState.selectedNodeId,
      nodes: pre.concat(parentNode).concat(post)
    });
  }

  function dump () {
    return simulationState;
  }
}

function createNode (id, parentId, gameState) {
  return {id, parentId, gameState, children: [], count: {}, score: {}};
}
