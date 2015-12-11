module.exports = isGameOver;

function isGameOver (state) {
  const gameState = state.tree[state.selected].state;

  return gameState.query(['score']).some((entity) => {
    return gameState.get(entity, 'score') === 1;
  });
}

