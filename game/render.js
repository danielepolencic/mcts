const query = require('./state').query;
const get = require('./state').get;

module.exports = render;

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

