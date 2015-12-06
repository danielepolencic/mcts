const SELECT_NODE = 'SELECT_NODE';
const EXPAND_STATE = 'EXPAND_STATE';
const SIMULATE = 'SIMULATE';
const BACKPROPAGATE = 'BACKPROPAGATE';

module.exports = {
  selectState,
  expandState,
  simulate,
  backpropagate,
  SELECT_NODE,
  EXPAND_STATE,
  SIMULATE,
  BACKPROPAGATE
};

function selectState (entity) {
  return {type: SELECT_NODE, entity};
}

function expandState () {
  return {type: EXPAND_STATE};
}

function simulate () {
  return {type: SIMULATE};
}

function backpropagate () {
  return {type: BACKPROPAGATE};
}

