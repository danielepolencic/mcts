const actions = require('./actions');

module.exports = gameReducer;

function gameReducer (state, action) {
  switch (action.type) {
    case actions.MOVE_ENTITY:
      return motionReducer(state, action.entity, action.direction);
    case actions.UPDATE_WINNER:
      return scoreReducer(state);
    case actions.ENTITY_TURN:
      return turnReducer(state, action.entity);
    default:
      return state;
  }
}

function motionReducer (state, entity, direction) {
  const board = {maxRow: 8, maxColumn: 8};

  return (canMove(state, entity, direction)) ?
    move(state, entity, direction) : state;

  function canMove (state, entity, direction) {
    switch (direction) {
      case 'up':
      case 0:
      case 38:
        return state.get(entity, 'y') > 0;
      case 'right':
      case 1:
      case 39:
        return state.get(entity, 'x') < board.maxColumn - 1;
      case 'down':
      case 2:
      case 40:
        return state.get(entity, 'y') < board.maxRow - 1;
      case 'left':
      case 3:
      case 37:
        return state.get(entity, 'x') > 0;
      default:
        return false;
    }
  }

  function move (state, entity, direction) {
    switch (direction) {
      case 'up':
      case 0:
      case 38:
        return state.set(entity, 'y', (y) => y - 1)
          .set(entity, 'move', () => 'up');
      case 'right':
      case 1:
      case 39:
        return state.set(entity, 'x', (x) => x + 1)
          .set(entity, 'move', () => 'right');
      case 'down':
      case 2:
      case 40:
        return state.set(entity, 'y', (y) => y + 1)
          .set(entity, 'move', () => 'down');
      case 'left':
      case 3:
      case 37:
        return state.set(entity, 'x', (x) => x - 1)
          .set(entity, 'move', () => 'left');
    }
  }
}

function scoreReducer (state) {
  return state.query(['score']).reduce((state, entity) => {
    const target = state.get(entity, 'target');
    const targetX = state.get(target, 'x');
    const targetY = state.get(target, 'y');
    const entityX = state.get(entity, 'x');
    const entityY = state.get(entity, 'y');

    return (targetX === entityX && targetY === entityY) ?
      state.set(entity, 'score', () => 1) : state;
  }, state);
}

function turnReducer (state, activeEntity) {
  const entities = state.query(['active']);

  return entities.reduce((state, entity) => {
    return state.set(entity, 'active', () => entity === activeEntity);
  }, state);
}

