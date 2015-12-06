const test = require('tape');
const createStore = require('../game/store');
const predictionReducer = require('../ai/reducers');
const gameReducer = require('../game/reducers');
const node = require('../ai/utils').node;
const actions = require('../ai/actions');
const get = require('../game/state').get;

test('select a node in the tree and expand it (hero)', (t) => {
  let currentStatus = void 0;

  const initialGameState = [
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
  ];

  const initialPredictionState = {
    selected: void 0,
    tree: [node(void 0, initialGameState)]
  };

  const simplePolicy = (entity) => (parent, children) => children[0];
  const predictionStore = createStore(predictionReducer(gameReducer, simplePolicy), initialPredictionState);
  predictionStore.dispatch(actions.selectState('ghost'));

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.tree.length, 1);
  t.equal(currentStatus.selected, 0);

  predictionStore.dispatch(actions.expandState());

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.tree.length, 4);
  t.equal(currentStatus.tree[0].children.join(''), '123');
  t.equal(get(currentStatus.tree[1].state)('hero', 'x'), 0);
  t.equal(get(currentStatus.tree[1].state)('hero', 'y'), 3);
  t.equal(get(currentStatus.tree[2].state)('hero', 'x'), 0);
  t.equal(get(currentStatus.tree[2].state)('hero', 'y'), 5);
  t.equal(get(currentStatus.tree[3].state)('hero', 'x'), 1);
  t.equal(get(currentStatus.tree[3].state)('hero', 'y'), 4);

  predictionStore.dispatch(actions.selectState('hero'));

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.selected, 1);

  predictionStore.dispatch(actions.simulate());

  currentStatus = predictionStore.getState();
  t.equal(get(currentStatus.tree[1].state)('hero', 'score'), 0);
  t.equal(get(currentStatus.tree[1].state)('ghost', 'score'), 0);

  predictionStore.dispatch(actions.backpropagate());

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.tree[1].count.hero, 1);
  t.equal(currentStatus.tree[1].score.hero, 0);
  t.equal(currentStatus.tree[0].count.hero, 1);
  t.equal(currentStatus.tree[0].score.hero, 0);

  t.end();
});

test('test simulation, backpropagation (hero)', (t) => {
  let currentStatus = void 0;

  const initialGameState = [
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
  ];

  const initialPredictionState = {
    selected: void 0,
    tree: [node(void 0, initialGameState)]
  };

  const simplePolicy = (entity) => (parent, children) => children[2];
  const predictionStore = createStore(predictionReducer(gameReducer, simplePolicy), initialPredictionState);
  predictionStore.dispatch(actions.selectState('ghost'));

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.selected, 0);
  predictionStore.dispatch(actions.expandState());

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.tree.length, 5);
  t.equal(currentStatus.tree[0].children.join(''), '1234');
  t.equal(get(currentStatus.tree[1].state)('hero', 'x'), 5);
  t.equal(get(currentStatus.tree[1].state)('hero', 'y'), 5);
  t.equal(get(currentStatus.tree[2].state)('hero', 'x'), 5);
  t.equal(get(currentStatus.tree[2].state)('hero', 'y'), 7);
  t.equal(get(currentStatus.tree[3].state)('hero', 'x'), 6);
  t.equal(get(currentStatus.tree[3].state)('hero', 'y'), 6);
  t.equal(get(currentStatus.tree[4].state)('hero', 'x'), 4);
  t.equal(get(currentStatus.tree[4].state)('hero', 'y'), 6);

  predictionStore.dispatch(actions.selectState('hero'));

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.selected, 3);

  predictionStore.dispatch(actions.simulate());

  currentStatus = predictionStore.getState();
  t.equal(get(currentStatus.tree[3].state)('hero', 'score'), 1);
  t.equal(get(currentStatus.tree[3].state)('ghost', 'score'), 0);

  predictionStore.dispatch(actions.backpropagate());

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.tree[3].count.hero, 1);
  t.equal(currentStatus.tree[3].score.hero, 1);
  t.equal(currentStatus.tree[0].count.hero, 1);
  t.equal(currentStatus.tree[0].score.hero, 1);

  t.end();
});

test('test simulation, backpropagation (ghost)', (t) => {
  let currentStatus = void 0;

  const initialGameState = [
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
  ];

  const initialPredictionState = {
    selected: void 0,
    tree: [node(void 0, initialGameState)]
  };

  const simplePolicy = (entity) => {
    const ids = [2, 1];
    return (parent, children) => {
      return children[ids.shift()];
    };
  }
  const predictionStore = createStore(predictionReducer(gameReducer, simplePolicy), initialPredictionState);
  predictionStore.dispatch(actions.selectState('ghost'));

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.tree.length, 1);
  t.equal(currentStatus.selected, 0);

  predictionStore.dispatch(actions.expandState());

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.tree.length, 5);
  t.equal(currentStatus.tree[0].children.join(''), '1234');
  t.equal(get(currentStatus.tree[1].state)('hero', 'x'), 4);
  t.equal(get(currentStatus.tree[1].state)('hero', 'y'), 5);
  t.equal(get(currentStatus.tree[2].state)('hero', 'x'), 4);
  t.equal(get(currentStatus.tree[2].state)('hero', 'y'), 7);
  t.equal(get(currentStatus.tree[3].state)('hero', 'x'), 5);
  t.equal(get(currentStatus.tree[3].state)('hero', 'y'), 6);
  t.equal(get(currentStatus.tree[4].state)('hero', 'x'), 3);
  t.equal(get(currentStatus.tree[4].state)('hero', 'y'), 6);

  predictionStore.dispatch(actions.selectState('hero'));

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.selected, 3);

  predictionStore.dispatch(actions.simulate());

  currentStatus = predictionStore.getState();
  t.equal(get(currentStatus.tree[3].state)('hero', 'score'), 0);
  t.equal(get(currentStatus.tree[3].state)('ghost', 'score'), 0);

  predictionStore.dispatch(actions.backpropagate());

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.tree[3].count.hero, 1);
  t.equal(currentStatus.tree[3].score.hero, 0);
  t.equal(currentStatus.tree[0].count.hero, 1);
  t.equal(currentStatus.tree[0].score.hero, 0);

  predictionStore.dispatch(actions.expandState());

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.tree.length, 9);
  t.equal(currentStatus.tree[3].children.join(''), '5678');
  t.equal(get(currentStatus.tree[5].state)('ghost', 'x'), 5);
  t.equal(get(currentStatus.tree[5].state)('ghost', 'y'), 4);
  t.equal(get(currentStatus.tree[6].state)('ghost', 'x'), 5);
  t.equal(get(currentStatus.tree[6].state)('ghost', 'y'), 6);
  t.equal(get(currentStatus.tree[7].state)('ghost', 'x'), 6);
  t.equal(get(currentStatus.tree[7].state)('ghost', 'y'), 5);
  t.equal(get(currentStatus.tree[8].state)('ghost', 'x'), 4);
  t.equal(get(currentStatus.tree[8].state)('ghost', 'y'), 5);

  predictionStore.dispatch(actions.selectState('ghost'));

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.selected, 6);

  predictionStore.dispatch(actions.simulate());

  currentStatus = predictionStore.getState();
  t.equal(get(currentStatus.tree[6].state)('hero', 'score'), 0);
  t.equal(get(currentStatus.tree[6].state)('ghost', 'score'), 1);

  predictionStore.dispatch(actions.backpropagate());

  currentStatus = predictionStore.getState();
  t.equal(currentStatus.tree[6].count.ghost, 1);
  t.equal(currentStatus.tree[6].score.ghost, 1);
  t.equal(currentStatus.tree[3].count.ghost, 1);
  t.equal(currentStatus.tree[3].score.ghost, 1);
  t.equal(currentStatus.tree[0].count.ghost, 1);
  t.equal(currentStatus.tree[0].score.ghost, 1);

  t.end();
});
