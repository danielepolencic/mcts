const query = require('../game/state').query;
const get = require('../game/state').get;

module.exports = isGameOver;

function isGameOver (state) {
  const gameState = state.tree[state.selected].state;

  return query(gameState)(['score']).some((entity) => {
    return get(gameState)(entity, 'score') === 1;
  });
}

