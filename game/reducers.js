const actions = require('./actions');

const query = require('./state').query;
const get = require('./state').get;
const set = require('./state').set;

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
        return get(state)(entity, 'y') > 0;
      case 'right':
      case 1:
      case 39:
        return get(state)(entity, 'x') < board.maxColumn - 1;
      case 'down':
      case 2:
      case 40:
        return get(state)(entity, 'y') < board.maxRow - 1;
      case 'left':
      case 3:
      case 37:
        return get(state)(entity, 'x') > 0;
      default:
        return false;
    }
  }

  function move (state, entity, direction) {
    switch (direction) {
      case 'up':
      case 0:
      case 38:
        return set(set(state)(entity, 'y', (y) => y - 1))(entity, 'move', () => 'up');
      case 'right':
      case 1:
      case 39:
        return set(set(state)(entity, 'x', (x) => x + 1))(entity, 'move', () => 'right');
      case 'down':
      case 2:
      case 40:
        return set(set(state)(entity, 'y', (y) => y + 1))(entity, 'move', () => 'down');
      case 'left':
      case 3:
      case 37:
        return set(set(state)(entity, 'x', (x) => x - 1))(entity, 'move', () => 'left');
    }
  }
}

function scoreReducer (state) {
  return query(state)(['score']).reduce((state, entity) => {
    const target = get(state)(entity, 'target');
    const targetX = get(state)(target, 'x');
    const targetY = get(state)(target, 'y');
    const entityX = get(state)(entity, 'x');
    const entityY = get(state)(entity, 'y');

    return (targetX === entityX && targetY === entityY) ?
      set(state)(entity, 'score', () => 1) : state;
  }, state);
}

function turnReducer (state, activeEntity) {
  const entities = query(state)(['active']);

  return entities.reduce((state, entity) => {
    return set(state)(entity, 'active', () => entity === activeEntity);
  }, state);
}

