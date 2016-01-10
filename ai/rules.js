module.exports = isGameOver;

function isGameOver (simulationState) {
  const {currentNodeId} = simulationState;
  const {gameState} = simulationState.nodes.get(currentNodeId);

  return gameState.query(['score']).some((entity) => {
    return gameState.get(entity, 'score') === 1;
  });
}

