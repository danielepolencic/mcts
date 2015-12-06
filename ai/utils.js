module.exports = {cloneTree, node};

function cloneTree (tree) {
  return tree.map((node) => Object.assign({}, node));
}

function node (parentId, state) {
  return {parentId, state, children: [], count: {}, score: {}};
}

