const test = require('tape');
const createStore = require('../game/store');
const predictionReducer = require('../ai/reducers');
const gameReducer = require('../game/reducers');
const actions = require('../ai/actions');

const GameState = require('../game/state');
const SimulationState = require('../ai/state');

test('select a node in the tree and expand it (hero)', (t) => {
  let currentStatus = void 0;

  const initialGameState = GameState([
    {entity: 'hero', name: 'position', x: 0, y: 4},
    {entity: 'hero', name: 'lastMove', move: 'up'},
    {entity: 'hero', name: 'count', count: 0},
    {entity: 'hero', name: 'score', score: 0},
    {entity: 'hero', name: 'player', playerName: 'pole'},
    {entity: 'hero', name: 'target', target: 'reward'},
    {entity: 'hero', name: 'active', active: false},
    {entity: 'hero', name: 'render', avatar: 'H'},
    {entity: 'ghost', name: 'position', x: 7, y: 0},
    {entity: 'ghost', name: 'lastMove', move: 'up'},
    {entity: 'ghost', name: 'count', count: 0},
    {entity: 'ghost', name: 'score', score: 0},
    {entity: 'ghost', name: 'ai', aiName: 'terminator'},
    {entity: 'ghost', name: 'target', target: 'hero'},
    {entity: 'ghost', name: 'active', active: true},
    {entity: 'ghost', name: 'render', avatar: 'G'},
    {entity: 'reward', name: 'position', x: 6, y: 6},
    {entity: 'reward', name: 'render', avatar: 'R'}
  ]);

  const initialPredictionState = SimulationState(initialGameState);

  const simplePolicy = (entity) => (simulationState) => {
    const childNodes = simulationState.getChildNodes();
    return childNodes[0].id;
  };
  const predictionStore = createStore(predictionReducer(gameReducer, simplePolicy), initialPredictionState);
  predictionStore.dispatch(actions.selectState('ghost'));

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.dump().nodes.length, 1);
  t.equal(currentStatus.dump().selectedNodeId, 0);

  predictionStore.dispatch(actions.expandState());

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.nodes.length, 4);
  t.equal(currentStatus.nodes[0].children.join(''), '123');
  t.equal(currentStatus.nodes[1].gameState.get('hero', 'x'), 0);
  t.equal(currentStatus.nodes[1].gameState.get('hero', 'y'), 3);
  t.equal(currentStatus.nodes[2].gameState.get('hero', 'x'), 0);
  t.equal(currentStatus.nodes[2].gameState.get('hero', 'y'), 5);
  t.equal(currentStatus.nodes[3].gameState.get('hero', 'x'), 1);
  t.equal(currentStatus.nodes[3].gameState.get('hero', 'y'), 4);

  predictionStore.dispatch(actions.selectState('hero'));

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.selectedNodeId, 1);

  predictionStore.dispatch(actions.simulate());

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.nodes[1].gameState.get('hero', 'score'), 0);
  t.equal(currentStatus.nodes[1].gameState.get('ghost', 'score'), 0);

  predictionStore.dispatch(actions.backpropagate());

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.nodes[1].count.hero, 1);
  t.equal(currentStatus.nodes[1].score.hero, 0);
  t.equal(currentStatus.nodes[0].count.hero, 1);
  t.equal(currentStatus.nodes[0].score.hero, 0);

  t.end();
});

test('test simulation, backpropagation (hero)', (t) => {
  let currentStatus = void 0;

  const initialGameState = GameState([
    {entity: 'hero', name: 'position', x: 5, y: 6},
    {entity: 'hero', name: 'lastMove', move: 'up'},
    {entity: 'hero', name: 'count', count: 0},
    {entity: 'hero', name: 'score', score: 0},
    {entity: 'hero', name: 'player', playerName: 'pole'},
    {entity: 'hero', name: 'target', target: 'reward'},
    {entity: 'hero', name: 'active', active: false},
    {entity: 'hero', name: 'render', avatar: 'H'},
    {entity: 'ghost', name: 'position', x: 6, y: 5},
    {entity: 'ghost', name: 'lastMove', move: 'up'},
    {entity: 'ghost', name: 'count', count: 0},
    {entity: 'ghost', name: 'score', score: 0},
    {entity: 'ghost', name: 'ai', aiName: 'terminator'},
    {entity: 'ghost', name: 'target', target: 'hero'},
    {entity: 'ghost', name: 'active', active: true},
    {entity: 'ghost', name: 'render', avatar: 'G'},
    {entity: 'reward', name: 'position', x: 6, y: 6},
    {entity: 'reward', name: 'render', avatar: 'R'}
  ]);

  const initialPredictionState = SimulationState(initialGameState);

  const simplePolicy = (entity) => (simulationState) => {
    const childNodes = simulationState.getChildNodes();
    return childNodes[2].id;
  };
  const predictionStore = createStore(predictionReducer(gameReducer, simplePolicy), initialPredictionState);
  predictionStore.dispatch(actions.selectState('ghost'));

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.selectedNodeId, 0);
  predictionStore.dispatch(actions.expandState());

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.nodes.length, 5);
  t.equal(currentStatus.nodes[0].children.join(''), '1234');
  t.equal(currentStatus.nodes[1].gameState.get('hero', 'x'), 5);
  t.equal(currentStatus.nodes[1].gameState.get('hero', 'y'), 5);
  t.equal(currentStatus.nodes[2].gameState.get('hero', 'x'), 5);
  t.equal(currentStatus.nodes[2].gameState.get('hero', 'y'), 7);
  t.equal(currentStatus.nodes[3].gameState.get('hero', 'x'), 6);
  t.equal(currentStatus.nodes[3].gameState.get('hero', 'y'), 6);
  t.equal(currentStatus.nodes[4].gameState.get('hero', 'x'), 4);
  t.equal(currentStatus.nodes[4].gameState.get('hero', 'y'), 6);

  predictionStore.dispatch(actions.selectState('hero'));

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.selectedNodeId, 3);

  predictionStore.dispatch(actions.simulate());

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.nodes[3].gameState.get('hero', 'score'), 1);
  t.equal(currentStatus.nodes[3].gameState.get('ghost', 'score'), 0);

  predictionStore.dispatch(actions.backpropagate());

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.nodes[3].count.hero, 1);
  t.equal(currentStatus.nodes[3].score.hero, 1);
  t.equal(currentStatus.nodes[0].count.hero, 1);
  t.equal(currentStatus.nodes[0].score.hero, 1);

  t.end();
});

test('test simulation, backpropagation (ghost)', (t) => {
  let currentStatus = void 0;

  const initialGameState = GameState([
    {entity: 'hero', name: 'position', x: 4, y: 6},
    {entity: 'hero', name: 'lastMove', move: 'up'},
    {entity: 'hero', name: 'count', count: 0},
    {entity: 'hero', name: 'score', score: 0},
    {entity: 'hero', name: 'player', playerName: 'pole'},
    {entity: 'hero', name: 'target', target: 'reward'},
    {entity: 'hero', name: 'active', active: false},
    {entity: 'hero', name: 'render', avatar: 'H'},
    {entity: 'ghost', name: 'position', x: 5, y: 5},
    {entity: 'ghost', name: 'lastMove', move: 'up'},
    {entity: 'ghost', name: 'count', count: 0},
    {entity: 'ghost', name: 'score', score: 0},
    {entity: 'ghost', name: 'ai', aiName: 'terminator'},
    {entity: 'ghost', name: 'target', target: 'hero'},
    {entity: 'ghost', name: 'active', active: true},
    {entity: 'ghost', name: 'render', avatar: 'G'},
    {entity: 'reward', name: 'position', x: 6, y: 6},
    {entity: 'reward', name: 'render', avatar: 'R'}
  ]);

  const initialPredictionState = SimulationState(initialGameState);

  const simplePolicy = (entity) => {
    const ids = [2, 1];
    return (simulationState) => {
      const childNodes = simulationState.getChildNodes();
      return childNodes[ids.shift()].id;
    };
  }
  const predictionStore = createStore(predictionReducer(gameReducer, simplePolicy), initialPredictionState);
  predictionStore.dispatch(actions.selectState('ghost'));

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.nodes.length, 1);
  t.equal(currentStatus.selectedNodeId, 0);

  predictionStore.dispatch(actions.expandState());

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.nodes.length, 5);
  t.equal(currentStatus.nodes[0].children.join(''), '1234');
  t.equal(currentStatus.nodes[1].gameState.get('hero', 'x'), 4);
  t.equal(currentStatus.nodes[1].gameState.get('hero', 'y'), 5);
  t.equal(currentStatus.nodes[2].gameState.get('hero', 'x'), 4);
  t.equal(currentStatus.nodes[2].gameState.get('hero', 'y'), 7);
  t.equal(currentStatus.nodes[3].gameState.get('hero', 'x'), 5);
  t.equal(currentStatus.nodes[3].gameState.get('hero', 'y'), 6);
  t.equal(currentStatus.nodes[4].gameState.get('hero', 'x'), 3);
  t.equal(currentStatus.nodes[4].gameState.get('hero', 'y'), 6);

  predictionStore.dispatch(actions.selectState('hero'));

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.selectedNodeId, 3);

  predictionStore.dispatch(actions.simulate());

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.nodes[3].gameState.get('hero', 'score'), 0);
  t.equal(currentStatus.nodes[3].gameState.get('ghost', 'score'), 0);

  predictionStore.dispatch(actions.backpropagate());

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.nodes[3].count.hero, 1);
  t.equal(currentStatus.nodes[3].score.hero, 0);
  t.equal(currentStatus.nodes[0].count.hero, 1);
  t.equal(currentStatus.nodes[0].score.hero, 0);

  predictionStore.dispatch(actions.selectState('hero'));
  predictionStore.dispatch(actions.expandState());

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.nodes.length, 9);
  t.equal(currentStatus.nodes[3].children.join(''), '5678');
  t.equal(currentStatus.nodes[5].gameState.get('ghost', 'x'), 5);
  t.equal(currentStatus.nodes[5].gameState.get('ghost', 'y'), 4);
  t.equal(currentStatus.nodes[6].gameState.get('ghost', 'x'), 5);
  t.equal(currentStatus.nodes[6].gameState.get('ghost', 'y'), 6);
  t.equal(currentStatus.nodes[7].gameState.get('ghost', 'x'), 6);
  t.equal(currentStatus.nodes[7].gameState.get('ghost', 'y'), 5);
  t.equal(currentStatus.nodes[8].gameState.get('ghost', 'x'), 4);
  t.equal(currentStatus.nodes[8].gameState.get('ghost', 'y'), 5);

  predictionStore.dispatch(actions.selectState('ghost'));

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.selectedNodeId, 6);

  predictionStore.dispatch(actions.simulate());

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.nodes[6].gameState.get('hero', 'score'), 0);
  t.equal(currentStatus.nodes[6].gameState.get('ghost', 'score'), 1);

  predictionStore.dispatch(actions.backpropagate());
  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.selectedNodeId, 6);

  currentStatus = predictionStore.getState().dump();
  t.equal(currentStatus.nodes[6].count.ghost, 1);
  t.equal(currentStatus.nodes[6].score.ghost, 1);
  t.equal(currentStatus.nodes[3].count.ghost, 1);
  t.equal(currentStatus.nodes[3].score.ghost, 1);
  t.equal(currentStatus.nodes[0].count.ghost, 1);
  t.equal(currentStatus.nodes[0].score.ghost, 1);

  t.end();
});
