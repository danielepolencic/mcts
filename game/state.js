const Immutable = require('immutable');

module.exports = (gameState) => {
  return GameState(Immutable.fromJS(gameState));
};

function GameState (gameState) {
  return {get, set, query, dump};

  function set (entity, key, fn) {
    const componentIndex = gameState.findIndex((component) => {
      return component.get('entity') === entity && component.has(key);
    });

    return GameState(gameState.updateIn([componentIndex, key], fn));
  }

  function get (entity, key) {
    const component = gameState.find((component) => {
      return component.get('entity') === entity && component.has(key);
    });
    return component.get(key);
  }

  function query (componentNames) {
    return gameState.filter((component) => componentNames.indexOf(component.get('name')) > -1)
      .map((component) => component.get('entity'))
      .toSet().toJS();
  }

  function dump () {
    return gameState.toJS();
  }

}
