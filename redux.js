'use strict';

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

function query (state) {
  return (componentNames) => {
    return state.filter((component) => componentNames.indexOf(component.name) > -1)
      .map((component) => component.entity)
      .reduce((uniques, component) => {
        return uniques.indexOf(component) > -1 ? uniques : uniques.concat(component);
      }, []);
  };
}

function set (state) {
  return (entity, key, fn) => {
    const componentIndex = state.findIndex((component) => {
      return component.entity === entity && key in component;
    });

    const newState = state.map((component) => Object.assign({}, component));
    newState[componentIndex][key] = fn(newState[componentIndex][key]);
    return newState;
  };
}

function get (state) {
  return (entity, key) => {
    const component = state.find((component) => {
      return component.entity === entity && key in component;
    });
    return component[key];
  };
}


const MOVE_ENTITY = 'MOVE_ENTITY';
const UPDATE_WINNER = 'UPDATE_WINNER';
const ENTITY_TURN = 'ENTITY_TURN';

function moveEntity (entity, direction) {
  return {type: MOVE_ENTITY, entity, direction};
}

function updateWinners () {
  return {type: UPDATE_WINNER};
}

function entityTurn (entity) {
  return {type: ENTITY_TURN, entity};
}

function gameReducer (state, action) {
  switch (action.type) {
    case MOVE_ENTITY:
      return motionReducer(state, action.entity, action.direction);
    case UPDATE_WINNER:
      return scoreReducer(state);
    case ENTITY_TURN:
      return turnReducer(state, action.entity);
    default:
      return state;
  }
}

function motionReducer (state, entity, direction) {
  const board = {maxRow: 8, maxColumn: 8};

  return (canMove(state, entity, direction)) ?
    move(state, entity, direction) : state;

  function canMove (state, entity, direction) {
    switch (direction) {
      case 'up':
      case 0:
      case 38:
        return get(state)(entity, 'y') > 0;
      case 'right':
      case 1:
      case 39:
        return get(state)(entity, 'x') < board.maxColumn - 1;
      case 'down':
      case 2:
      case 40:
        return get(state)(entity, 'y') < board.maxRow - 1;
      case 'left':
      case 3:
      case 37:
        return get(state)(entity, 'x') > 0;
      default:
        return false;
    }
  }

  function move (state, entity, direction) {
    switch (direction) {
      case 'up':
      case 0:
      case 38:
        return set(state)(entity, 'y', (y) => y - 1);
      case 'right':
      case 1:
      case 39:
        return set(state)(entity, 'x', (x) => x + 1);
      case 'down':
      case 2:
      case 40:
        return set(state)(entity, 'y', (y) => y + 1);
      case 'left':
      case 3:
      case 37:
        return set(state)(entity, 'x', (x) => x - 1);
    }
  }
}

function scoreReducer (state) {
  return query(state)(['score']).reduce((state, entity) => {
    const target = get(state)(entity, 'target');
    const targetX = get(state)(target, 'x');
    const targetY = get(state)(target, 'y');
    const entityX = get(state)(entity, 'x');
    const entityY = get(state)(entity, 'y');

    return (targetX === entityX && targetY === entityY) ?
      set(state)(entity, 'score', () => 1) : state;
  }, state);
}

function turnReducer (state, activeEntity) {
  const entities = query(state)(['active']);

  return entities.reduce((state, entity) => {
    return set(state)(entity, 'active', () => entity === activeEntity);
  }, state);
}

function createStore (reducer, initialState) {
  let currentState = initialState;
  let listeners = [];

  return {dispatch, getState, subscribe};

  function dispatch (action) {
    currentState = reducer(currentState, action);
    listeners.slice().forEach(listener => listener(currentState));
  }

  function subscribe (listener) {
    listeners.push(listener);
    let isSubscribed = true;

    return function unsubscribe () {
      if (!isSubscribed) return;

      isSubscribed = false;
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  function getState () {
    return currentState;
  }
}

function render (container) {
  return (state) => {
    const board = {maxRow: 8, maxColumn: 8};

    let grid = new Array(board.maxRow * board.maxColumn)
      .join(',').split(',').map(() => '<div></div>');

    query(state)(['render']).forEach((entity) => {
      const x = get(state)(entity, 'x');
      const y = get(state)(entity, 'y');
      const avatar = get(state)(entity, 'avatar');
      grid[x + (y * board.maxColumn)] = `<div>${avatar}</div>`;
    });

    container.innerHTML = grid.join('');
  };
}

const store = createStore(gameReducer, initialGameState);
const container = document.querySelector('.container');

store.subscribe(render(container));
render(container)(initialGameState);

document.addEventListener('keydown', (e) => {
  if (e.keyCode > 40 || e.keyCode < 37) return;
  e.preventDefault();

  const state = store.getState()
  const players = query(state)(['active']);
  const activePlayerIndex = players.findIndex((player) => get(state)(player, 'active'));
  const currentPlayer = players.slice(activePlayerIndex - 1)[0];

  store.dispatch(entityTurn(currentPlayer));
  store.dispatch(moveEntity(currentPlayer, e.keyCode));
  store.dispatch(updateWinners());
});




// PREDICTION

const initialPredictionState = {
  selected: void 0,
  tree: [node(void 0, initialGameState)]
};

function cloneTree (tree) {
  return tree.map((node) => Object.assign({}, node));
}

function node (parentId, state) {
  return {parentId, state, children: [], count: {}, score: {}};
}

const SELECT_NODE = 'SELECT_NODE';
const EXPAND_STATE = 'EXPAND_STATE';
const SIMULATE = 'SIMULATE';
const BACKPROPAGATE = 'BACKPROPAGATE';

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

function predictionReducer (gameReducer, UCT) {
  return (state, action) => {
    switch (action.type) {
      case SELECT_NODE:
        return selectReducer(state, UCT(action.entity));
      case EXPAND_STATE:
        return expandReducer(state);
      case SIMULATE:
        return simulationReducer(state);
      case BACKPROPAGATE:
        return backpropagationReducer(state);
      default:
        return state;
    }
  };
}

function selectReducer (state, policy) {
  const getNode = (id) => state.tree[id];

  const selected = (function selectChild (root) {
    const children = root.children;
    if (children.length === 0) return root;

    const child = policy(root, children.map(getNode));

    return selectChild(child);
  })(state.tree[0]);

  return {
    selected: state.tree.findIndex((node) => node === selected),
    tree: cloneTree(state.tree)
  };
}

function UCT (entity) {
  return (parent, children) => {
    const parentCount = parent.count[entity] || 1;

    const scores = children.map((node) => {
      const score = node.score[entity] | 0;
      const count = node.count[entity] || 1;

      return ((score + 1) / count) + Math.sqrt(2 * Math.log(parentCount / count));
    });

    const totalScore = scores.reduce((total, score) => {return total + score}, 0);

    const normalisedScores = scores.map((score) => score / totalScore);

    const child = Math.max.apply(void 0, normalisedScores);
    const index = normalisedScores.findIndex((score) => score === child);

    return children[index];
  };
}

function expandReducer (state) {
  const tree = cloneTree(state.tree);
  const selected = tree[state.selected];
  const entity = query(selected.state)(['active']).filter((entity) => {
    return !get(selected.state)(entity, 'active');
  })[0];
  const childStates = ['up', 'down', 'right', 'left'].map((direction) => {
    const message = moveEntity(entity, direction);
    const childState = state.tree[state.selected].state;
    return gameReducer(gameReducer(childState, entityTurn(entity)), message);
  });
  const childNodes = childStates.filter((childState) => {
    return get(childState)('ghost', 'x') !== get(selected.state)('ghost', 'x') ||
      get(childState)('ghost', 'y') !== get(selected.state)('ghost', 'y') ||
      get(childState)('hero', 'x') !== get(selected.state)('hero', 'x') ||
      get(childState)('hero', 'y') !== get(selected.state)('hero', 'y');
  })
  .map((child) => node(state.selected, child))
  .map((node) => tree.push(node) - 1);

  tree[state.selected].children = childNodes;

  return {selected: state.selected, tree};
};

function simulationReducer (state) {
  const childState = state.tree[state.selected].state;
  const child = gameReducer(childState, updateWinners());
  const tree = cloneTree(state.tree);
  tree[state.selected].state = child;

  return {selected: state.selected, tree};
}

function backpropagationReducer (state) {
  const tree = cloneTree(state.tree);
  const getNode = (id) => state.tree[id];

  const selected = state.tree[state.selected];
  const entities = query(selected.state)(['score']);
  const entity = query(selected.state)(['active']).filter((entity) => {
    return get(selected.state)(entity, 'active');
  })[0];
  updateScore(selected, selected.state);

  function updateScore (node, state) {
    entities.forEach((entity) => {
      const score = get(state)(entity, 'score');
      return node.score[entity] = (node.score[entity] | 0) + score;
    });
    node.count[entity] = (node.count[entity] | 0) + 1;
    const parentNode = getNode(node.parentId);
    if (parentNode) updateScore(parentNode, state);
  }

  return {selected: state.selected, tree};
};

const predictionStore = createStore(predictionReducer(gameReducer, UCT), initialPredictionState);
// predictionStore.subscribe((state) => console.log(JSON.stringify(state, null, 2)));
predictionStore.subscribe((state) => console.log(state));

function predictBestMove () {
  const entity = Math.random() > 0.5 ? 'ghost' : 'player';
  predictionStore.dispatch(selectState(entity));
  predictionStore.dispatch(simulate());
  predictionStore.dispatch(backpropagate());
  predictionStore.dispatch(expandState());
}
