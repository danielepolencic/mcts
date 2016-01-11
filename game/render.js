module.exports = render;

function render (container) {
  return (gameState) => {
    const board = {maxRow: 8, maxColumn: 8};

    let grid = new Array(board.maxRow * board.maxColumn)
      .join(',').split(',').map(() => '<div></div>');

    gameState.query(['render']).forEach((entityName) => {
      const x = gameState.get(entityName, 'x');
      const y = gameState.get(entityName, 'y');
      const avatar = gameState.get(entityName, 'avatar');
      grid[x + (y * board.maxColumn)] = `<div>${avatar}</div>`;
    });

    container.innerHTML = grid.join('');
  };
}

