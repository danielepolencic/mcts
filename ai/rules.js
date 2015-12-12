module.exports = isGameOver;

function isGameOver (simulationState) {
  const gameState = simulationState.getCurrentNode().gameState;

  return gameState.query(['score']).some((entity) => {
    return gameState.get(entity, 'score') === 1;
  });
}

