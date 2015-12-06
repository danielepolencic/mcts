module.exports = UCT;

function UCT (entity) {
  return (parent, children) => {
    const parentCount = parent.count[entity] || 1;

    const scores = children.map((node) => {
      const score = node.score[entity] | 0;
      const count = node.count[entity] || 1;

      return ((score + 1) / count) + Math.sqrt(2 * Math.log(parentCount / count));
    });

    const totalScore = scores.reduce((total, score) => {return total + score}, 0);

    const normalisedScores = scores.map((score) => score / totalScore);
    const cumulativeScores = normalisedScores.reduce((cumulative, score) => {
      return [cumulative[0] + score, cumulative[1].concat(cumulative[0] + score)];
    }, [0, []])[1];

    const random = Math.random();
    const index = cumulativeScores.findIndex((score) => score >= random);

    return children[index];
  };
}
