const actions = require('./actions');

const gameActions = require('../game/actions');
const gameReducer = require('../game/reducers');

const {Range} = require('immutable');
const {SimulationNode} = require('./state');

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
    const {currentNodeId} = simulationState;
    const {children} = simulationState.nodes.get(currentNodeId);
    if (children.size === 0) return simulationState;

    const selectedNodeId = policy(simulationState);

    return selectChild(simulationState.set('currentNodeId', selectedNodeId));
  })(simulationState.set('currentNodeId', 0));
}

function expandReducer (simulationState) {
  const {currentNodeId} = simulationState;
  const {gameState} = simulationState.nodes.get(currentNodeId);
  const entity = gameState.query(['active']).find((entity) => {
    return !gameState.get(entity, 'active');
  });

  const expandedGameStates = ['up', 'down', 'right', 'left']
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
    .map((newGameState) => SimulationNode(newGameState, currentNodeId));

  return simulationState.withMutations((simulationState) => {
    const initialSize = simulationState.nodes.size;
    simulationState.update('nodes', (nodes) => nodes.withMutations((nodes) => {
      expandedGameStates.forEach((gameState) => nodes.push(gameState));
    }));

    const childrenIds = Range(initialSize, simulationState.nodes.size);
    simulationState.setIn(['nodes', currentNodeId, 'children'], childrenIds);
  });
};

function simulationReducer (simulationState) {
  const {currentNodeId} = simulationState;
  return simulationState.updateIn(['nodes', currentNodeId, 'gameState'], (gameState) => {
    return gameReducer(gameState, gameActions.updateWinners());
  });
}

function backpropagationReducer (simulationState) {
  const {currentNodeId} = simulationState;
  const {gameState} = simulationState.nodes.get(currentNodeId);

  const entities = gameState.query(['score']);
  const entity = gameState.query(['active']).find((entity) => {
    return gameState.get(entity, 'active');
  });

  // player can lose the game...
  const scores = entities.map((entity) => gameState.get(entity, 'score'));
  return (function updateScore (simulationState, currentNodeId) {
    const {gameState, parentId} = simulationState.nodes.get(currentNodeId);
    const backpropagatedState = entities.reduce((simulationState, entity, index) => {
        return simulationState.updateIn(['nodes', currentNodeId, 'score', entity], (s) => (s | 0) + scores[index]);
      }, simulationState)
      .updateIn(['nodes', currentNodeId, 'count', entity], (count) => (count | 0) + 1);

    return parentId === undefined ? backpropagatedState
      : updateScore(backpropagatedState, parentId);
  })(simulationState, currentNodeId);
};

