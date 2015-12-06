const node = require('./utils.js').node;
const actions = require('./actions');
const predictionReducer = require('./reducers');
const UCT = require('./uct');
const isGameOver = require('./rules');
const createStore = require('../game/store');
const gameReducer = require('../game/reducers');

const graph = require('./graph');

module.exports = moveAi;

function predictBestMove (predictionStore) {
  predictionStore.dispatch(actions.selectState(Math.random() > 0.5 ? 'ghost' : 'player'));

  if (isGameOver(predictionStore.getState())) return;

  predictionStore.dispatch(actions.simulate());
  predictionStore.dispatch(actions.backpropagate());

  if (!isGameOver(predictionStore.getState()))
    predictionStore.dispatch(actions.expandState());
}

function moveAi (state) {
  const initialPredictionState = {
    selected: void 0,
    tree: [node(void 0, state)]
  };
  const predictionStore = createStore(predictionReducer(gameReducer, UCT), initialPredictionState);

  graph.destroy();
  graph.create();

  for (let i = 0; i < 1000; i++) predictBestMove(predictionStore);

  graph.update(graph.generate(predictionStore.getState())(0));

  return findBestMove(predictionStore.getState());
}

function findBestMove (state) {
  const getNode = (id) => state.tree[id];
  const children = state.tree[0].children;
  if (children.length === 0) return state.tree[0];

  const scores = children.map(getNode)
    .map((child) => child.score.ghost / child.count.ghost);
  const bestScore = Math.max.apply(null, scores);
  const index = scores.findIndex((score) => score === bestScore);
  return getNode(children[index]);
}
