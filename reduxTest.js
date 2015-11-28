'use strict';

function test1 () {
  let currentStatus = void 0;

  const initialGameState = [
    {entity: 'hero', name: 'position', x: 0, y: 4},
    {entity: 'hero', name: 'count', count: 0},
    {entity: 'hero', name: 'score', score: 0},
    {entity: 'hero', name: 'player', playerName: 'pole'},
    {entity: 'hero', name: 'target', target: 'reward'},
    {entity: 'hero', name: 'active', active: false},
    {entity: 'hero', name: 'render', avatar: 'H'},
    {entity: 'ghost', name: 'position', x: 7, y: 0},
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
  predictionStore.dispatch(selectState('ghost'));

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree.length === 1);
  console.assert(currentStatus.selected === 0);

  predictionStore.dispatch(expandState());

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree.length === 4);
  console.assert(currentStatus.tree[0].children.join('') === '123');
  console.assert(get(currentStatus.tree[1].state)('hero', 'x') === 0);
  console.assert(get(currentStatus.tree[1].state)('hero', 'y') === 3);
  console.assert(get(currentStatus.tree[2].state)('hero', 'x') === 0);
  console.assert(get(currentStatus.tree[2].state)('hero', 'y') === 5);
  console.assert(get(currentStatus.tree[3].state)('hero', 'x') === 1);
  console.assert(get(currentStatus.tree[3].state)('hero', 'y') === 4);

  predictionStore.dispatch(selectState('hero'));

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.selected === 1);

  predictionStore.dispatch(simulate());

  currentStatus = predictionStore.getState();
  console.assert(get(currentStatus.tree[1].state)('hero', 'score') === 0);
  console.assert(get(currentStatus.tree[1].state)('ghost', 'score') === 0);

  predictionStore.dispatch(backpropagate());

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree[1].count.hero === 1);
  console.assert(currentStatus.tree[1].score.hero === 0);
  console.assert(currentStatus.tree[0].count.hero === 1);
  console.assert(currentStatus.tree[0].score.hero === 0);
}

function test2 () {
  let currentStatus = void 0;

  const initialGameState = [
    {entity: 'hero', name: 'position', x: 5, y: 6},
    {entity: 'hero', name: 'count', count: 0},
    {entity: 'hero', name: 'score', score: 0},
    {entity: 'hero', name: 'player', playerName: 'pole'},
    {entity: 'hero', name: 'target', target: 'reward'},
    {entity: 'hero', name: 'active', active: false},
    {entity: 'hero', name: 'render', avatar: 'H'},
    {entity: 'ghost', name: 'position', x: 6, y: 5},
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
  predictionStore.dispatch(selectState('ghost'));

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree.length === 1);
  console.assert(currentStatus.selected === 0);

  predictionStore.dispatch(expandState());

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree.length === 5);
  console.assert(currentStatus.tree[0].children.join('') === '1234');
  console.assert(get(currentStatus.tree[1].state)('hero', 'x') === 5);
  console.assert(get(currentStatus.tree[1].state)('hero', 'y') === 5);
  console.assert(get(currentStatus.tree[2].state)('hero', 'x') === 5);
  console.assert(get(currentStatus.tree[2].state)('hero', 'y') === 7);
  console.assert(get(currentStatus.tree[3].state)('hero', 'x') === 6);
  console.assert(get(currentStatus.tree[3].state)('hero', 'y') === 6);
  console.assert(get(currentStatus.tree[4].state)('hero', 'x') === 4);
  console.assert(get(currentStatus.tree[4].state)('hero', 'y') === 6);

  predictionStore.dispatch(selectState('hero'));

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.selected === 3);

  predictionStore.dispatch(simulate());

  currentStatus = predictionStore.getState();
  console.assert(get(currentStatus.tree[3].state)('hero', 'score') === 1);
  console.assert(get(currentStatus.tree[3].state)('ghost', 'score') === 0);

  predictionStore.dispatch(backpropagate());

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree[3].count.hero === 1);
  console.assert(currentStatus.tree[3].score.hero === 1);
  console.assert(currentStatus.tree[0].count.hero === 1);
  console.assert(currentStatus.tree[0].score.hero === 1);
}

function test3 () {
  let currentStatus = void 0;

  const initialGameState = [
    {entity: 'hero', name: 'position', x: 4, y: 6},
    {entity: 'hero', name: 'count', count: 0},
    {entity: 'hero', name: 'score', score: 0},
    {entity: 'hero', name: 'player', playerName: 'pole'},
    {entity: 'hero', name: 'target', target: 'reward'},
    {entity: 'hero', name: 'active', active: false},
    {entity: 'hero', name: 'render', avatar: 'H'},
    {entity: 'ghost', name: 'position', x: 5, y: 5},
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
  predictionStore.dispatch(selectState('ghost'));

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree.length === 1);
  console.assert(currentStatus.selected === 0);

  predictionStore.dispatch(expandState());

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree.length === 5);
  console.assert(currentStatus.tree[0].children.join('') === '1234');
  console.assert(get(currentStatus.tree[1].state)('hero', 'x') === 4);
  console.assert(get(currentStatus.tree[1].state)('hero', 'y') === 5);
  console.assert(get(currentStatus.tree[2].state)('hero', 'x') === 4);
  console.assert(get(currentStatus.tree[2].state)('hero', 'y') === 7);
  console.assert(get(currentStatus.tree[3].state)('hero', 'x') === 5);
  console.assert(get(currentStatus.tree[3].state)('hero', 'y') === 6);
  console.assert(get(currentStatus.tree[4].state)('hero', 'x') === 3);
  console.assert(get(currentStatus.tree[4].state)('hero', 'y') === 6);

  predictionStore.dispatch(selectState('hero'));

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.selected === 3);

  predictionStore.dispatch(simulate());

  currentStatus = predictionStore.getState();
  console.assert(get(currentStatus.tree[3].state)('hero', 'score') === 0);
  console.assert(get(currentStatus.tree[3].state)('ghost', 'score') === 0);

  predictionStore.dispatch(backpropagate());

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree[3].count.hero === 1);
  console.assert(currentStatus.tree[3].score.hero === 0);
  console.assert(currentStatus.tree[0].count.hero === 1);
  console.assert(currentStatus.tree[0].score.hero === 0);

  predictionStore.dispatch(expandState());

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree.length === 9);
  console.assert(currentStatus.tree[3].children.join('') === '5678');
  console.assert(get(currentStatus.tree[5].state)('ghost', 'x') === 5);
  console.assert(get(currentStatus.tree[5].state)('ghost', 'y') === 4);
  console.assert(get(currentStatus.tree[6].state)('ghost', 'x') === 5);
  console.assert(get(currentStatus.tree[6].state)('ghost', 'y') === 6);
  console.assert(get(currentStatus.tree[7].state)('ghost', 'x') === 6);
  console.assert(get(currentStatus.tree[7].state)('ghost', 'y') === 5);
  console.assert(get(currentStatus.tree[8].state)('ghost', 'x') === 4);
  console.assert(get(currentStatus.tree[8].state)('ghost', 'y') === 5);

  predictionStore.dispatch(selectState('ghost'));

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.selected === 6);

  predictionStore.dispatch(simulate());

  currentStatus = predictionStore.getState();
  console.assert(get(currentStatus.tree[6].state)('hero', 'score') === 0);
  console.assert(get(currentStatus.tree[6].state)('ghost', 'score') === 1);

  predictionStore.dispatch(backpropagate());

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree[6].count.ghost === 1);
  console.assert(currentStatus.tree[6].score.ghost === 1);
  console.assert(currentStatus.tree[3].count.ghost === 1);
  console.assert(currentStatus.tree[3].score.ghost === 1);
  console.assert(currentStatus.tree[0].count.ghost === 1);
  console.assert(currentStatus.tree[0].score.ghost === 1);
}

function test4 () {
  let currentStatus = void 0;

  const initialGameState = [
    {entity: 'hero', name: 'position', x: 5, y: 6},
    {entity: 'hero', name: 'count', count: 0},
    {entity: 'hero', name: 'score', score: 0},
    {entity: 'hero', name: 'player', playerName: 'pole'},
    {entity: 'hero', name: 'target', target: 'reward'},
    {entity: 'hero', name: 'active', active: false},
    {entity: 'hero', name: 'render', avatar: 'H'},
    {entity: 'ghost', name: 'position', x: 6, y: 5},
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
  predictionStore.dispatch(selectState('ghost'));

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree.length === 1);
  console.assert(currentStatus.selected === 0);

  predictionStore.dispatch(expandState());

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree.length === 5);
  console.assert(currentStatus.tree[0].children.join('') === '1234');
  console.assert(get(currentStatus.tree[1].state)('hero', 'x') === 5);
  console.assert(get(currentStatus.tree[1].state)('hero', 'y') === 5);
  console.assert(get(currentStatus.tree[2].state)('hero', 'x') === 5);
  console.assert(get(currentStatus.tree[2].state)('hero', 'y') === 7);
  console.assert(get(currentStatus.tree[3].state)('hero', 'x') === 6);
  console.assert(get(currentStatus.tree[3].state)('hero', 'y') === 6);
  console.assert(get(currentStatus.tree[4].state)('hero', 'x') === 4);
  console.assert(get(currentStatus.tree[4].state)('hero', 'y') === 6);

  predictionStore.dispatch(selectState('hero'));

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.selected === 3);

  predictionStore.dispatch(simulate());

  currentStatus = predictionStore.getState();
  console.assert(get(currentStatus.tree[3].state)('hero', 'score') === 1);
  console.assert(get(currentStatus.tree[3].state)('ghost', 'score') === 0);

  predictionStore.dispatch(backpropagate());

  currentStatus = predictionStore.getState();
  console.assert(currentStatus.tree[3].count.hero === 1);
  console.assert(currentStatus.tree[3].score.hero === 1);
  console.assert(currentStatus.tree[0].count.hero === 1);
  console.assert(currentStatus.tree[0].score.hero === 1);
}

test1('test select, expansion (hero)');
test2('test simulation, backpropagation (hero)');
test3('test simulation, backpropagation (ghost)');
