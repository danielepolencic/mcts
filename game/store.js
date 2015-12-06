module.exports = createStore;

function createStore (reducer, initialState) {
  let currentState = initialState;
  let listeners = [];

  return {dispatch, getState, subscribe};

  function dispatch (action) {
    currentState = reducer(currentState, action);
    listeners.slice().forEach(listener => listener(currentState));
  }

  function subscribe (listener) {
    listeners.push(listener);
    let isSubscribed = true;

    return function unsubscribe () {
      if (!isSubscribed) return;

      isSubscribed = false;
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  function getState () {
    return currentState;
  }
}

