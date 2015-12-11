const actions = require('./actions');
const node = require('./utils').node;
const cloneTree = require('./utils').cloneTree;

const gameActions = require('../game/actions');
const gameReducer = require('../game/reducers');

module.exports = predictionReducer;

function predictionReducer (gameReducer, UCT) {
  return (state, action) => {
    switch (action.type) {
      case actions.SELECT_NODE:
        return selectReducer(state, UCT(action.entity));
      case actions.EXPAND_STATE:
        return expandReducer(state);
      case actions.SIMULATE:
        return simulationReducer(state);
      case actions.BACKPROPAGATE:
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

function expandReducer (state) {
  const tree = cloneTree(state.tree);
  const selected = tree[state.selected];
  const entity = selected.state.query(['active']).filter((entity) => {
    return !selected.state.get(entity, 'active');
  })[0];
  const childStates = ['up', 'down', 'right', 'left'].map((direction) => {
    const message = gameActions.moveEntity(entity, direction);
    const childState = state.tree[state.selected].state;
    return gameReducer(gameReducer(childState, gameActions.entityTurn(entity)), message);
  });
  const childNodes = childStates.filter((childState) => {
    return childState.get('ghost', 'x') !== selected.state.get('ghost', 'x') ||
      childState.get('ghost', 'y') !== selected.state.get('ghost', 'y') ||
      childState.get('hero', 'x') !== selected.state.get('hero', 'x') ||
      childState.get('hero', 'y') !== selected.state.get('hero', 'y');
  })
  .map((child) => node(state.selected, child))
  .map((node) => tree.push(node) - 1);

  tree[state.selected].children = childNodes;

  return {selected: state.selected, tree};
};

function simulationReducer (state) {
  const childState = state.tree[state.selected].state;
  const child = gameReducer(childState, gameActions.updateWinners());
  const tree = cloneTree(state.tree);
  tree[state.selected].state = child;

  return {selected: state.selected, tree};
}

function backpropagationReducer (state) {
  const tree = cloneTree(state.tree);
  const getNode = (id) => state.tree[id];

  const selected = state.tree[state.selected];
  const entities = selected.state.query(['score']);
  const entity = selected.state.query(['active']).filter((entity) => {
    return selected.state.get(entity, 'active');
  })[0];
  updateScore(selected, selected.state);

  function updateScore (node, state) {
    entities.forEach((entity) => {
      const score = state.get(entity, 'score');
      return node.score[entity] = (node.score[entity] | 0) + score;
    });
    node.count[entity] = (node.count[entity] | 0) + 1;
    const parentNode = getNode(node.parentId);
    if (parentNode) updateScore(parentNode, state);
  }

  return {selected: state.selected, tree};
};

