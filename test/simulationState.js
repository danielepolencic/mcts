const test = require('tape');
const GameState = require('../game/state');
const SimulationState = require('../ai/state');

function createSimulationState () {
  const gameState = GameState([
    {entity: 'hero', name: 'position', x: 4, y: 6},
    {entity: 'ghost', name: 'score', score: 0},
    {entity: 'reward', name: 'position', x: 6, y: 6},
    {entity: 'reward', name: 'render', avatar: 'R'}
  ]);
  return SimulationState(gameState);
}

test('it should add a child state', (t) => {
  const v0 = createSimulationState();
  const gameState = v0.getCurrentNode().gameState;

  const v1 = v0.setChildNode(gameState.set('hero', 'x', () => 99));

  t.notEqual(v1, v0);
  t.equal(v0.dump().selectedNodeId, 0);
  t.equal(v1.dump().selectedNodeId, 0);
  t.equal(v0.dump().nodes.length, 1);
  t.equal(v1.dump().nodes.length, 2);
  t.notEqual(v1.dump().nodes, v0.dump().nodes);
  t.notEqual(v1.dump().nodes[0], v0.dump().nodes[0]);
  t.equal(v1.dump().nodes[0].gameState, v0.dump().nodes[0].gameState);
  t.equal(v1.dump().nodes[1].gameState.get('hero', 'x'), 99);
  t.end();
});

test('it should add multiple child states', (t) => {
  const v0 = createSimulationState();
  const gameState = v0.getCurrentNode().gameState;

  const v1 = v0.setChildNode(gameState.set('hero', 'x', () => 99));
  const v2 = v1.setChildNode(gameState.set('hero', 'x', () => 66));

  t.notEqual(v1, v0);
  t.notEqual(v2, v1);
  t.equal(v2.dump().nodes.length, 3);
  t.notEqual(v1.dump().nodes[0], v0.dump().nodes[0]);
  t.notEqual(v2.dump().nodes[0], v1.dump().nodes[0]);
  t.equal(v2.dump().nodes[1], v1.dump().nodes[1]);
  t.equal(v2.dump().nodes[2].gameState.get('hero', 'x'), 66);
  t.end();
});

test('it should get the current node', (t) => {
  const game = createSimulationState();
  const currentNode = game.getCurrentNode();

  t.equal(currentNode.id, 0);
  t.deepEqual(currentNode.children, []);
  t.equal(currentNode.parentId, undefined);
  t.deepEqual(currentNode.score, {});
  t.deepEqual(currentNode.count, {});
  t.ok(currentNode.gameState);

  t.end();
});

test('it should set the current node', (t) => {
  const v0 = createSimulationState();
  const gameState = v0.getCurrentNode().gameState;

  const v1 = v0.setChildNode(gameState.set('hero', 'x', () => 99));
  const child = v1.getChildNodes()[0];

  const v2 = v1.setCurrentNode(child);

  t.notEqual(v1, v0);
  t.notEqual(v2, v1);
  t.equal(v0.dump().selectedNodeId, 0);
  t.equal(v1.dump().selectedNodeId, 0);
  t.equal(v2.dump().selectedNodeId, 1);

  t.end();
});

test('should get all children', (t) => {
  const v0 = createSimulationState();
  const gameState = v0.getCurrentNode().gameState;

  const v1 = v0.setChildNode(gameState.set('hero', 'x', () => 99));
  const v2 = v1.setChildNode(gameState.set('hero', 'x', () => 66));
  const children = v2.getChildNodes();

  t.equal(v2.dump().nodes[1].gameState.get('hero', 'x'), 99);
  t.equal(v2.dump().nodes[2].gameState.get('hero', 'x'), 66);

  t.end();
});

