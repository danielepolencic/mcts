const MOVE_ENTITY = 'MOVE_ENTITY';
const UPDATE_WINNER = 'UPDATE_WINNER';
const ENTITY_TURN = 'ENTITY_TURN';

module.exports = {
  moveEntity,
  updateWinners,
  entityTurn,
  MOVE_ENTITY,
  UPDATE_WINNER,
  ENTITY_TURN
};

function moveEntity (entity, direction) {
  return {type: MOVE_ENTITY, entity, direction};
}

function updateWinners () {
  return {type: UPDATE_WINNER};
}

function entityTurn (entity) {
  return {type: ENTITY_TURN, entity};
}

