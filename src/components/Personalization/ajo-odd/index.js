import evaluateCondition from "./conditions";

const getStepsMap = journey => {
  const { steps = [] } = journey;
  const result = {};

  steps.forEach(step => {
    const { uid } = step;

    if (uid) {
      result[uid] = step;
    }
  });

  return result;
};

const augmentWithStepsMap = journey => {
  journey.stepsMap = getStepsMap(journey);

  return journey;
};

const shouldContinue = step => {
  if (step === undefined) {
    return false;
  }

  const { uid } = step;

  if (uid === "end") {
    return false;
  }

  const { transitions = [] } = step;

  if (transitions.length === 0) {
    return false;
  }

  return true;
};

const matches = (transition, journeyContext) => {
  const { condition } = transition;

  if (condition !== undefined) {
    return evaluateCondition(condition, journeyContext);
  }

  return true;
};

const getNextStep = (step, journeyContext) => {
  const { transitions = [] } = step;
  const transition = transitions.find(e => matches(e, journeyContext));
  const { targetStep } = transition || {};

  if (targetStep === undefined) {
    return undefined;
  }

  return journeyContext.journey.stepsMap[targetStep];
};

const hasScope = (decisionScopes, scope) => {
  return decisionScopes.find(e => e === scope) !== undefined;
};

const handleAction = (step, journeyContext) => {
  const { action = {} } = step;
  const { uid, type } = action;

  if (type !== "unitaryMessageAction" || uid === undefined) {
    return undefined;
  }

  const { variants = [] } = step;
  const { event } = journeyContext;

  return variants
    .map(e => e.body)
    .filter(e => Object.keys(e).length > 0)
    .filter(e => hasScope(event.decisionScopes, e.scope))[0];
};

const createPropositions = (event, journey) => {
  const { initialStep } = journey;
  const journeyContext = { event, journey };
  const items = [];
  let currentStep = journey.stepsMap[initialStep];

  while (shouldContinue(currentStep)) {
    const { nodeType } = currentStep;

    switch (nodeType) {
      case "start": {
        currentStep = getNextStep(currentStep, journeyContext);
        break;
      }
      case "condition": {
        currentStep = getNextStep(currentStep, journeyContext);
        break;
      }
      case "action": {
        const variant = handleAction(currentStep, journeyContext);

        if (variant !== undefined) {
          items.push(variant);
        }

        currentStep = undefined;
        break;
      }
      default:
        break;
    }
  }

  return items.map(e => {
    return {
      id: journey.uid,
      scope: e.scope,
      items: e.items
    };
  });
};

export default (event, journeys) => {
  const result = [];

  journeys.forEach(e => {
    const journey = augmentWithStepsMap(e);
    const decisions = createPropositions(event, journey);

    result.push(...decisions);
  });

  return result;
};
