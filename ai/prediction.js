const actions = require('./actions');
const predictionReducer = require('./reducers');
const UCT = require('./uct');
const isGameOver = require('./rules');
const createStore = require('../game/store');
const gameReducer = require('../game/reducers');

const graph = require('./graph');
const SimulationState = require('./state');

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

  for (let i = 0; i < 3; i++) predictBestMove(predictionStore);

  graph.update(graph.generate(predictionStore.getState()));

  return findBestMove(predictionStore.getState());
}

function findBestMove (simulationState) {
  const rootNode = simulationState.setCurrentNode(0);
  const children = rootNode.getChildNodes();
  if (children.length === 0) return rootNode;

  const scores = children
    .map((node) => {
      if (node.count.ghost | 0 === 0) return 0;
      return (node.score.ghost | 0) / (node.count.ghost | 0);
    });
  const bestScore = Math.max.apply(null, scores);
  const index = scores.findIndex((score) => score === bestScore);
  return simulationState.setCurrentNode(children[index].id);
}
