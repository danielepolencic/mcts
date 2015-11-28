const Immutable = require('immutable');

const state = Immutable.fromJS([
  {entity: 'hero', name: 'position', x: 0, y: 4},
  {entity: 'hero', name: 'count', count: 0},
  {entity: 'hero', name: 'score', score: 0},
  {entity: 'hero', name: 'player', playerName: 'pole'},
  {entity: 'ghost', name: 'position', x: 7, y: 0},
  {entity: 'ghost', name: 'count', count: 0},
  {entity: 'ghost', name: 'score', score: 0},
  {entity: 'ghost', name: 'ai', aiName: 'terminator'},
  {entity: 'reward', name: 'position', x: 6, y: 6}
]);

function moveSystem (board = {maxRow: 8, maxColumn: 8}) => (state, direction, query = () => true) => {

  return state.map((component) => {
    return component.every(query) && component.contains('position') && canMove(direction, component) ?
      move(direction, component) : component;
  });

  const canMove = (direction, component) => {
    switch (direction) {
      case 'up':
      case 0:
        return component.get('y') > 0;
      case 'right':
      case 1:
        return component.get('x') < board.maxColumn - 1;
      case 'down':
      case 2:
        return component.get('y') < board.maxRow - 1;
      case 'left':
      case 3:
        return component.get('x') > 0;
      default:
        return false;
    }
  }

  const move = (direction, component) {
    switch (direction) {
      case 'up':
      case 0:
        return component.update('y', (y) => y - 1);
      case 'right':
      case 1:
        return component.update('x', (x) => x + 1);
      case 'down':
      case 2:
        return component.update('y', (y) => y + 1);
      case 'left':
      case 3:
        return component.update('x', (x) => x - 1);
    }
  }
}

function scoreSystem (state) {
  const ghost = state.find((component) => component.constains('ghost') && component.contains('position'));
  const player = state.find((component) => component.constains('player') && component.contains('position'));
  const reward = state.find((component) => component.constains('reward') && component.contains('position'));

  return state.update(
    state.findIndex((c) => c.contains('ghost') && c.contains('score')),
    (score) => (ghost.get('x') === player.get('x') &&
                ghost.get('y') === player.get('y')) | 0
  )
  .update(
    state.findIndex((c) => c.contains('player') && c.contains('score')),
    (score) => (reward.get('x') === player.get('x') &&
                reward.get('y') === player.get('y')) | 0
  );
}

function countSystem (state, query = () => true) {
  state.map((component) => {
    return (component.has('count') && component.every(query)) ?
      component.update('count', (count) => count += 1) : component;
  });
}
