import parse from "./parser";

export default ({ artifact, context }) => {
  const { rules } = parse(artifact);
  const propositions = [];

  for (let i = 0; i < rules.length; i += 1) {
    const consequences = rules[i].evaluate(context);

    if (consequences.length === 0) {
      /* eslint-disable no-continue */
      continue;
    }

    for (let j = 0; j < consequences.length; j += 1) {
      propositions.push(consequences[j].detail);
    }
  }

  return propositions;
};
