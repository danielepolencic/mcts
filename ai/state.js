const Immutable = require('immutable');

const SimulationState = Immutable.Record({
  currentNodeId: 0,
  nodes: Immutable.List.of()
});

const SimulationNode = Immutable.Record({
  parentId: undefined,
  gameState: undefined,
  children: Immutable.List.of(),
  count: Immutable.Map(),
  score: Immutable.Map()
});

module.exports = {
  SimulationState: (gameState) => {
    const node = new SimulationNode({gameState});
    return new SimulationState({nodes: Immutable.List.of(node)});
  },
  SimulationNode: (gameState, parentId) => new SimulationNode({gameState, parentId})
};
