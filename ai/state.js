module.exports = (gameState) => {
  return SimulationState({
    selectedNodeId: 0,
    nodes: [createNode(0, undefined, gameState)]
  });
};

// todo: maybe node is immutable too?

function SimulationState (simulationState) {
  return {
    getCurrentNode, setCurrentNode, updateCurrentNode,
    getChildNodes, setChildNode,
    getScore, setScore,
    getCount, setCount,
    dump
  };

  function getCurrentNode () {
    return simulationState.nodes[simulationState.selectedNodeId];
  }

  // maybe get game state...
  function setCurrentNode (nodeId) {
    return SimulationState({selectedNodeId: nodeId, nodes: simulationState.nodes});
  }

  function updateCurrentNode (gameState) {
    const nodes = simulationState.nodes.slice();
    const selectedNodeId = simulationState.selectedNodeId;
    nodes[selectedNodeId] = Object.assign({}, nodes[selectedNodeId], {gameState});
    return SimulationState({selectedNodeId, nodes});
  }

  function getChildNodes () {
    const currentNode = simulationState.nodes[simulationState.selectedNodeId];
    return currentNode.children.map((nodeId) => {
      return simulationState.nodes[nodeId];
    });
  }

  // maybe set game State
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

  // wish I could do that on children too (UCT)
  function getScore (entity) {
    const currentNodeId = simulationState.selectedNodeId;
    return simulationState.nodes[currentNodeId].score[entity];
  }

  function setScore (entity, fn) {
    const selectedNodeId = simulationState.selectedNodeId;
    const nodes = simulationState.nodes.slice();
    const currentNode = nodes[selectedNodeId];
    const score = Object.assign({}, currentNode.score, {
      [entity]: fn(currentNode.score[entity])
    });
    nodes[selectedNodeId] = Object.assign({}, currentNode, {score});
    return SimulationState({selectedNodeId, nodes});
  }

  function getCount (entity) {
    const currentNodeId = simulationState.selectedNodeId;
    return simulationState.nodes[currentNodeId].count[entity];
  }

  function setCount (entity, fn) {
    const currentNodeId = simulationState.selectedNodeId;
    const nodes = simulationState.nodes.slice();
    const currentNode = nodes[currentNodeId];
    const count = Object.assign({}, currentNode.count, {
      [entity]: fn(currentNode.count[entity])
    });
    nodes[currentNodeId] = Object.assign({}, currentNode, {count});
    return SimulationState({selectedNodeId: simulationState.selectedNodeId, nodes});
  }
}

function createNode (id, parentId, gameState) {
  return {id, parentId, gameState, children: [], count: {}, score: {}};
}
