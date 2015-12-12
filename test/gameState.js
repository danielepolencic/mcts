const test = require('tape');
const GameState = require('../game/state');

function createGameState () {
  return GameState([
    {entity: 'hero', name: 'position', x: 4, y: 6},
    {entity: 'ghost', name: 'score', score: 0},
    {entity: 'reward', name: 'position', x: 6, y: 6},
    {entity: 'reward', name: 'render', avatar: 'R'}
  ]);
}

test('it should get a property', (t) => {
  const gameState = createGameState();

  t.equal(gameState.get('hero', 'x'), 4);
  t.end();
});

test('it should set a property', (t) => {
  const v0 = createGameState();

  const v1 = v0.set('hero', 'x', () => 5);

  t.notEqual(v1, v0);
  t.notEqual(v1.dump()[0], v0.dump()[0]);
  t.equal(v1.dump()[1], v0.dump()[1]);
  t.equal(v1.dump()[2], v0.dump()[2]);
  t.equal(v1.dump()[3], v0.dump()[3]);
  t.equal(v1.dump()[0].x, 5);
  t.end();
});

test('it should query for entities', (t) => {
  const gameState = createGameState();

  const entities = gameState.query(['position']);

  t.deepEqual(entities, ['hero', 'reward']);
  t.end();
});
