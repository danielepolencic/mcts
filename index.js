'use strict';

const container = document.querySelector('.game');

let state = {
  id: 0,
  parent: 0,
  children: [],
  count: [1, 1],
  score: [0, 0],
  player: [1, 1],
  reward: [4, 6],
  ghost: [5, 3],
  lastMove: 'player'
};
let tree = [state];

const createChildNode = (node, type) => (player, ghost) => {
  return {
    id: 0,
    parent: node.id,
    children: [],
    count: [1, 1],
    score: [0, 0],
    reward: node.reward.slice(),
    ghost: ghost,
    player: player,
    lastMove: type
  };
};

const updateGhostWithScore = (score) => (node) => {
  return {
    id: node.id,
    parent: node.parent,
    children: node.children.slice(),
    count: [node.count[0], node.count[1] + 1],
    score: [node.score[0] + score[0], node.score[1] + score[1]],
    reward: node.reward.slice(),
    ghost: node.ghost.slice(),
    player: node.player.slice(),
    lastMove: node.lastMove
  };
};

const updatePlayerWithScore = (score) => (node) => {
  return {
    id: node.id,
    parent: node.parent,
    children: node.children.slice(),
    count: [node.count[0] + 1, node.count[1]],
    score: [node.score[0] + score[0], node.score[1] + score[1]],
    reward: node.reward.slice(),
    ghost: node.ghost.slice(),
    player: node.player.slice(),
    lastMove: node.lastMove
  };
};

const updatePlayerWithPosition = (position) => (node) => {
  return {
    id: node.id,
    parent: node.parent,
    children: node.children.slice(),
    count: node.count.slice(),
    score: node.score.slice(),
    reward: node.reward.slice(),
    ghost: node.ghost.slice(),
    player: position,
    lastMove: node.lastMove
  };
}

function select (tree) {
  const get = getNode(tree);

  return function selectChild (root, policy) {
    const children = root.children;
    if (children.length === 0) return [root];

    const child = policy(root, children.map(get));

    return [root].concat(selectChild(child, policy));
  }
}

function expandPlayer (node) {
  const children = [];
  const create = createChildNode(node, 'player');
  const x = node.player[0];
  const y = node.player[1];
  const ghost = node.ghost;

  // move right
  if ((x + 1) % 8 !== 0)
    children.push(create([x + 1, y], ghost));

  // move down
  if ((y + 8) < 64)
    children.push(create([x, y + 1], ghost));

  // move left
  if ((x - 1) > 0 && (x - 1) % 7 !== 0)
    children.push(create([x - 1, y], ghost));

  // move up
  if ((y - 8) > 0)
    children.push(create([x, y - 1], ghost));

  return children;
}

function expandGhost (node) {
  const children = [];
  const create = createChildNode(node, 'ghost');
  const x = node.ghost[0];
  const y = node.ghost[1];
  const player = node.player;

  // move right
  if ((x + 1) % 8 !== 0)
    children.push(create(player, [x + 1, y]));

  // move down
  if ((y + 8) < 64)
    children.push(create(player, [x, y + 1]));

  // move left
  if ((x - 1) > 0 && (x - 1) % 7 !== 0)
    children.push(create(player, [x - 1, y]));

  // move up
  if ((y - 8) > 0)
    children.push(create(player, [x, y - 1]));

  return children;
}

function simulation (node) {
  const scorePlayer = (node.player[0] === node.reward[0] &&
    node.player[1] === node.reward[1]) | 0;
  const scoreGhost = (node.player[0] === node.ghost[0] &&
    node.player[1] === node.ghost[1]) | 0;
  return [scorePlayer, scoreGhost];
}

function backpropagationPlayer (sequence, score) {
  return sequence.map(updatePlayerWithScore(score));
}

function backpropagationGhost (sequence, score) {
  return sequence.map(updateGhostWithScore(score));
}

const isTerminal = (node) => {
  const isWin = (node.player[0] === node.reward[0] &&
    node.player[1] === node.reward[1]);
  const isLoss = (node.player[0] === node.ghost[0] &&
    node.player[1] === node.ghost[1]);
  return isWin || isLoss;
};

const isFirstPlayerSimulation = (node) => {
  return node.count[0] === 1;
};

const isFirstGhostSimulation = (node) => {
  return node.count[1] === 1;
};

const uctPlayer = (parent, children) => {
  const C = 1.4142135;
  const scores = children.map((node) => (node.score[0] + 1 / node.count[0]) + C * Math.sqrt(Math.log(parent.count[0] / node.count[0])));
  const totalScore = scores.reduce((total, score) => {return total + score}, 0);
  const normalisedScores = scores.map((score) => score / totalScore);
  const cumulativeScores = normalisedScores.reduce((cumulative, score) => {
    return [cumulative[0] + score, cumulative[1].concat(cumulative[0] + score)];
  }, [0, []])[1];

  const random = Math.random();

  const index = cumulativeScores.findIndex((node) => node >= random);
  return children[index];
};

const uctGhost = (parent, children) => {
  const C = 1.4142135;
  const scores = children.map((node) => (node.score[1] + 1 / node.count[1]) + C * Math.sqrt(Math.log(parent.count[1] / node.count[1])));
  const totalScore = scores.reduce((total, score) => {return total + score}, 0);
  const normalisedScores = scores.map((score) => score / totalScore);
  const cumulativeScores = normalisedScores.reduce((cumulative, score) => {
    return [cumulative[0] + score, cumulative[1].concat(cumulative[0] + score)];
  }, [0, []])[1];

  const random = Math.random();

  const index = cumulativeScores.findIndex((node) => node >= random);
  return children[index];
};

const updateTree = (tree) => (node) => tree[node.id] = node;

const insertTree = (tree) => {
  let lastIndex = tree.length;
  return (node) => {
    node.id = lastIndex++;
    tree[node.parent].children.push(node.id);
    tree.push(node);
  };
};

const getNode = (tree) => (nodeId) => tree[nodeId];

function computeTree (root) {
  let tree = [root];
  for (let i = 0; i < 10; i++) {
    let player = Math.random() > 0.5 ? 'ghost' : 'player';

    let seq = select(tree)(tree[0], player === 'ghost' ? uctGhost : uctPlayer);
    let leaf = seq.slice(-1)[0];

    switch (leaf.lastMove) {

      case 'ghost':
        if (!isFirstGhostSimulation(leaf) && isTerminal(leaf)) continue;
      if (isFirstGhostSimulation(leaf)) {
        const score = simulation(leaf);
        backpropagationGhost(seq, score).forEach(updateTree(tree));
      } else {
        expandPlayer(leaf).forEach(insertTree(tree));
      }
      break;

      case 'player':
        if (!isFirstPlayerSimulation(leaf) && isTerminal(leaf)) continue;
      if (isFirstPlayerSimulation(leaf)) {
        const score = simulation(leaf);
        backpropagationPlayer(seq, score).forEach(updateTree(tree));
      } else {
        expandGhost(leaf).forEach(insertTree(tree));
      }
      break;

    }
  }
  return tree;
}

const render = (element, state) => {
  const board = new Array(64).join(',').split(',');
  const player = state.player[0] + 8 * state.player[1];
  const ghost = state.ghost[0] + 8 * state.ghost[1];
  const reward = state.reward[0] + 8 * state.reward[1];
  element.innerHTML = board.map((_, index) => {
    if (index === player) return '<div>P</div>';
    if (index === ghost) return '<div>G</div>';
    if (index === reward) return '<div>R</div>';
    return '<div></div>';
  }).join('');
};

const findBestMove = (tree) => {
  const children = tree[0].children;
  if (children.length === 0) return root;

  const scores = children.map(getNode(tree))
    .map((child) => child.score[1] / child.count[1]);
  const bestScore = Math.max.apply(null, scores);
  const index = scores.findIndex((score) => score === bestScore);
  return getNode(tree)(children[index]);
};

document.addEventListener('keydown', (e) => {
  if (e.keyCode > 40 || e.keyCode < 37) return;
  e.preventDefault();

  let newState = void 0;

  switch (e.keyCode) {
    case 37:
      if (canMoveLeft(state)) newState = moveLeft(state);
      break;
    case 38:
      if (canMoveUp(state)) newState = moveUp(state);
      break;
    case 39:
      if (canMoveRight(state)) newState = moveRight(state);
      break;
    case 40:
      if (canMoveDown(state)) newState = moveDown(state);
      break;
  }

  if (!!newState) {
    const newTree = computeTree(newState);
    const bestState = findBestMove(newTree);
    render(container, bestState);

    update(generateGraph(Object.assign({}, newTree))(0));

    tree = newTree;
    state = bestState;
  }
});

render(container, state);
update(generateGraph(Object.assign({}, [state])));

const canMoveDown = (state) => state.player[1] < 7;
const canMoveUp = (state) => state.player[1] > 0;
const canMoveLeft = (state) => state.player[0] > 0;
const canMoveRight = (state) => state.player[0] < 7;

const moveLeft = (state) => createChildNode(state, 'player')([
  state.player[0] - 1, state.player[1]
], state.ghost.slice());
const moveRight = (state) => createChildNode(state, 'player')([
  state.player[0] + 1, state.player[1]
], state.ghost.slice());
const moveUp = (state) => createChildNode(state, 'player')([
  state.player[0], state.player[1] - 1
], state.ghost.slice());
const moveDown = (state) => createChildNode(state, 'player')([
  state.player[0], state.player[1] + 1
], state.ghost.slice());
