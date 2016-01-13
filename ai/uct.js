module.exports = UCT;

function UCT (entity) {
  return (simulationNodes, currentNodeId) => {
    const {gameState, count, children} = simulationNodes.get(currentNodeId);

    const parentCount = count.get(entity) || 1;

    const scores = children.map((nodeId) => {
      const {score, count} = simulationNodes.get(nodeId);
      const entityScore = score.get(entity) | 0;
      const entityCount = count.get(entity) || 1;

      return ((entityScore + 1) / entityCount) + Math.sqrt(2 * Math.log(parentCount / entityCount));
    });

    const totalScore = scores.reduce((total, score) => {return total + score}, 0);

    const normalisedScores = scores.map((score) => score / totalScore);
    const cumulativeScores = normalisedScores.reduce((cumulative, score) => {
      return [cumulative[0] + score, cumulative[1].concat(cumulative[0] + score)];
    }, [0, []])[1];

    const random = Math.random();
    const index = cumulativeScores.findIndex((score) => score >= random);

    return children.get(index);
  };
}
