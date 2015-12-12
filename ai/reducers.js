const actions = require('./actions');

const gameActions = require('../game/actions');
const gameReducer = require('../game/reducers');

module.exports = predictionReducer;

function predictionReducer (gameReducer, UCT) {
  return (simulationState, action) => {
    switch (action.type) {
      case actions.SELECT_NODE:
        return selectReducer(simulationState, UCT(action.entity));
      case actions.EXPAND_STATE:
        return expandReducer(simulationState);
      case actions.SIMULATE:
        return simulationReducer(simulationState);
      case actions.BACKPROPAGATE:
        return backpropagationReducer(simulationState);
      default:
        return simulationState;
    }
  };
}

function selectReducer (simulationState, policy) {
  return (function selectChild (simulationState) {
    const children = simulationState.getCurrentNode().children;
    if (children.length === 0) return simulationState;

    const nodeId = policy(simulationState);

    return selectChild(simulationState.setCurrentNode(nodeId));
  })(simulationState.setCurrentNode(0));
}

function expandReducer (simulationState) {
  const gameState = simulationState.getCurrentNode().gameState;
  const entity = gameState.query(['active']).find((entity) => {
    return !gameState.get(entity, 'active');
  });

  return ['up', 'down', 'right', 'left']
    .map((direction) => {
      const newGameState = gameReducer(gameState, gameActions.entityTurn(entity));
      const message = gameActions.moveEntity(entity, direction);
      return gameReducer(newGameState, message);
    })
    .filter((newGameState) => {
      return newGameState.get('ghost', 'x') !== gameState.get('ghost', 'x') ||
        newGameState.get('ghost', 'y') !== gameState.get('ghost', 'y') ||
        newGameState.get('hero', 'x') !== gameState.get('hero', 'x') ||
        newGameState.get('hero', 'y') !== gameState.get('hero', 'y');
    })
    .reduce((simulationState, gameState) => {
      return simulationState.setChildNode(gameState);
    }, simulationState);
};

function simulationReducer (simulationState) {
  const gameState = simulationState.getCurrentNode().gameState;
  const newGameState = gameReducer(gameState, gameActions.updateWinners());
  return simulationState.updateCurrentNode(newGameState);
}

function backpropagationReducer (simulationState) {
  const gameState = simulationState.getCurrentNode().gameState;
  const currentNode = simulationState.getCurrentNode().id;
  const entities = gameState.query(['score']);
  const entity = gameState.query(['active']).find((entity) => {
    return gameState.get(entity, 'active');
  });

  // long story short: you need to compute score just once and not for every
  // iteration.
  // if you compute the score for every iteration, that game state might not
  // have the same score
  const score = gameState.get(entity, 'score');
  return (function updateScore (simulationState) {
    const gameState = simulationState.getCurrentNode().gameState;
    const backpropagatedState = entities
    .reduce((simulationState, entity) => {
      return simulationState.setScore(entity, (s) => (s | 0) + score);
    }, simulationState)
    .setCount(entity, (count) => (count | 0) + 1);

    const parentId = backpropagatedState.getCurrentNode().parentId;
    return parentId === undefined ? backpropagatedState
      : updateScore(backpropagatedState.setCurrentNode(parentId));
  })(simulationState).setCurrentNode(currentNode);
};

