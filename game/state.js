module.exports = {query, get, set};

function query (state) {
  return (componentNames) => {
    return state.filter((component) => componentNames.indexOf(component.name) > -1)
      .map((component) => component.entity)
      .reduce((uniques, component) => {
        return uniques.indexOf(component) > -1 ? uniques : uniques.concat(component);
      }, []);
  };
}

function set (state) {
  return (entity, key, fn) => {
    const componentIndex = state.findIndex((component) => {
      return component.entity === entity && key in component;
    });

    const newState = state.map((component) => Object.assign({}, component));
    newState[componentIndex][key] = fn(newState[componentIndex][key]);
    return newState;
  };
}

function get (state) {
  return (entity, key) => {
    const component = state.find((component) => {
      return component.entity === entity && key in component;
    });
    return component[key];
  };
}

