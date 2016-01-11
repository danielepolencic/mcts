'use strict';
const actions = require('./game/actions');
const gameReducer = require('./game/reducers');
const createStore = require('./game/store');
const render = require('./game/render');

const GameState = require('./game/state');

const moveAi = require('./ai/prediction');

const initialGameState = GameState([
  {entity: 'hero', name: 'position', x: 4, y: 6},
  {entity: 'hero', name: 'lastMove', move: 'up'},
  {entity: 'hero', name: 'score', score: 0},
  {entity: 'hero', name: 'player', playerName: 'pole'},
  {entity: 'hero', name: 'target', target: 'reward'},
  {entity: 'hero', name: 'active', active: false},
  {entity: 'hero', name: 'render', avatar: 'H'},
  {entity: 'ghost', name: 'position', x: 6, y: 5},
  {entity: 'ghost', name: 'lastMove', move: 'up'},
  {entity: 'ghost', name: 'score', score: 0},
  {entity: 'ghost', name: 'ai', aiName: 'terminator'},
  {entity: 'ghost', name: 'target', target: 'hero'},
  {entity: 'ghost', name: 'active', active: true},
  {entity: 'ghost', name: 'render', avatar: 'G'},
  {entity: 'reward', name: 'position', x: 6, y: 6},
  {entity: 'reward', name: 'render', avatar: 'R'}
]);

// TODO:
//
// - player turn order
// - collapsible graph
// - don't move back, please

const store = createStore(gameReducer, initialGameState);
const container = document.querySelector('.container');

store.subscribe(render(container));
render(container)(initialGameState);

document.addEventListener('keydown', (e) => {
  if (e.keyCode > 40 || e.keyCode < 37) return;
  e.preventDefault();

  const gameState = store.getState();
  const currentPlayer = gameState.query(['active']).filter((entityName) => {
    return !gameState.get(entityName, 'active');
  })[0];

  store.dispatch(actions.entityTurn(currentPlayer));
  store.dispatch(actions.moveEntity(currentPlayer, e.keyCode));
  store.dispatch(actions.updateWinners());

  setTimeout(() => {
    const move = moveAi(store.getState()).get('ghost', 'move');
    console.log('move: ', move);
    store.dispatch(actions.entityTurn('ghost'));
    store.dispatch(actions.moveEntity('ghost', move));
    store.dispatch(actions.updateWinners());
  }, 10);
});

