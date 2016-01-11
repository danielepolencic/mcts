const actions = require('./actions');

module.exports = gameReducer;

function gameReducer (gameState, action) {
  switch (action.type) {
    case actions.MOVE_ENTITY:
      return motionReducer(gameState, action.entity, action.direction);
    case actions.UPDATE_WINNER:
      return scoreReducer(gameState);
    case actions.ENTITY_TURN:
      return turnReducer(gameState, action.entity);
    default:
      return gameState;
  }
}

function motionReducer (gameState, entityName, direction) {
  const board = {maxRow: 8, maxColumn: 8};

  return canMove(gameState, entityName, direction) ?
    move(gameState, entityName, direction) : gameState;

  function canMove (gameState, entityName, direction) {
    switch (direction) {
      case 'up':
      case 0:
      case 38:
        return gameState.get(entityName, 'y') > 0;
      case 'right':
      case 1:
      case 39:
        return gameState.get(entityName, 'x') < board.maxColumn - 1;
      case 'down':
      case 2:
      case 40:
        return gameState.get(entityName, 'y') < board.maxRow - 1;
      case 'left':
      case 3:
      case 37:
        return gameState.get(entityName, 'x') > 0;
      default:
        return false;
    }
  }

  function move (gameState, entityName, direction) {
    switch (direction) {
      case 'up':
      case 0:
      case 38:
        return gameState.set(entityName, 'y', (y) => y - 1)
          .set(entityName, 'move', () => 'up');
      case 'right':
      case 1:
      case 39:
        return gameState.set(entityName, 'x', (x) => x + 1)
          .set(entityName, 'move', () => 'right');
      case 'down':
      case 2:
      case 40:
        return gameState.set(entityName, 'y', (y) => y + 1)
          .set(entityName, 'move', () => 'down');
      case 'left':
      case 3:
      case 37:
        return gameState.set(entityName, 'x', (x) => x - 1)
          .set(entityName, 'move', () => 'left');
    }
  }
}

function scoreReducer (gameState) {
  return gameState.query(['score']).reduce((gameState, entityName) => {
    const target = gameState.get(entityName, 'target');
    const targetX = gameState.get(target, 'x');
    const targetY = gameState.get(target, 'y');
    const entityX = gameState.get(entityName, 'x');
    const entityY = gameState.get(entityName, 'y');

    return (targetX === entityX && targetY === entityY) ?
      gameState.set(entityName, 'score', () => 1) : gameState;
  }, gameState);
}

function turnReducer (gameState, activeEntityName) {
  const entities = gameState.query(['active']);

  return entities.reduce((gameState, entityName) => {
    return gameState.set(entityName, 'active', () => entityName === activeEntityName);
  }, gameState);
}

