const actions = require('./actions');
const predictionReducer = require('./reducers');
const UCT = require('./uct');
const isGameOver = require('./rules');
const createStore = require('../game/store');
const gameReducer = require('../game/reducers');

const graph = require('./graph');
const {SimulationState} = require('./state');

module.exports = moveAi;

function predictBestMove (predictionStore) {
  predictionStore.dispatch(actions.selectState(Math.random() > 0.5 ? 'ghost' : 'player'));

  if (isGameOver(predictionStore.getState())) return;

  predictionStore.dispatch(actions.simulate());
  predictionStore.dispatch(actions.backpropagate());

  if (!isGameOver(predictionStore.getState()))
    predictionStore.dispatch(actions.expandState());
}

function moveAi (gameState) {
  const initialPredictionState = SimulationState(gameState);
  const reducer = predictionReducer(gameReducer, UCT);
  const predictionStore = createStore(reducer, initialPredictionState);

  graph.destroy();
  graph.create();

  for (let i = 0; i < 5000; i++) predictBestMove(predictionStore);

  graph.update(graph.generate(predictionStore.getState()));

  return findBestMove(predictionStore.getState());
}

function findBestMove (simulationState) {
  const {children, gameState} = simulationState.getIn(['nodes', 0]);
  if (children.size === 0) return gameState;

  const scores = children
    .map((nodeId) => {
      const {count, score} = simulationState.getIn(['nodes', nodeId]);
      if ((count.get('ghost') | 0) === 0) return 0;
      return (score.get('ghost') | 0) / (count.get('ghost') | 0);
    });
  const bestScore = scores.max();
  const index = scores.findIndex((score) => score === bestScore);
  return simulationState.getIn(['nodes', children.get(index), 'gameState']);
}
