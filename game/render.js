module.exports = render;

function render (container) {
  return (state) => {
    const board = {maxRow: 8, maxColumn: 8};

    let grid = new Array(board.maxRow * board.maxColumn)
      .join(',').split(',').map(() => '<div></div>');

    state.query(['render']).forEach((entity) => {
      const x = state.get(entity, 'x');
      const y = state.get(entity, 'y');
      const avatar = state.get(entity, 'avatar');
      grid[x + (y * board.maxColumn)] = `<div>${avatar}</div>`;
    });

    container.innerHTML = grid.join('');
  };
}

