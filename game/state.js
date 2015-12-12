module.exports = GameState;

function GameState (state) {
  return {get, set, query, dump};

  function set (entity, key, fn) {
    const componentIndex = state.findIndex((component) => {
      return component.entity === entity && key in component;
    });

    const pre = state.slice(0, componentIndex);
    const post = state.slice(componentIndex + 1);

    const component = Object.assign({}, state[componentIndex]);
    component[key] = fn(component[key]);
    return GameState(pre.concat(component).concat(post));
  }

  function get (entity, key) {
    const component = state.find((component) => {
      return component.entity === entity && key in component;
    });
    return component[key];
  }

  function query (componentNames) {
    return state.filter((component) => componentNames.indexOf(component.name) > -1)
      .map((component) => component.entity)
      .reduce((uniques, component) => {
        return uniques.indexOf(component) > -1 ? uniques : uniques.concat(component);
      }, []);
  }

  function dump () {
    return state;
  }

}
