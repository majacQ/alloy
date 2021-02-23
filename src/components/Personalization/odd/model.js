import { createEquals, createNotEquals, createContains } from "./matchers";

const NOT = "not";
const AND = "and";
const OR = "or";
const MATCHERS = {
  eq: createEquals(),
  ne: createNotEquals(),
  co: createContains()
};

const evaluateNot = (context, conditions) => {
  const result = true;

  if (conditions.length === 0) {
    return result;
  }

  // For NOT we ONLY care about first condition
  return !conditions[0].evaluate(context);
};

const evaluateAnd = (context, conditions) => {
  let result = true;

  for (let i = 0; i < conditions.length; i += 1) {
    result = result && conditions[i].evaluate(context);

    if (!result) {
      return false;
    }
  }

  return result;
};

const evaluateOr = (context, conditions) => {
  let result = false;

  for (let i = 0; i < conditions.length; i += 1) {
    result = result || conditions[i].evaluate(context);

    if (result) {
      return true;
    }
  }

  return result;
};

export const createRules = (version, rules) => {
  return { version, rules };
};

export const createRule = (condition, consequences) => {
  return {
    evaluate: context => {
      if (condition.evaluate(context)) {
        return consequences;
      }

      return [];
    },
    toString: () => {
      return `Rule{condition=${condition}, consequences=${consequences}}`;
    }
  };
};

export const createCondition = (type, definition) => {
  return {
    evaluate: context => {
      return definition.evaluate(context);
    },
    toString() {
      return `Condition{type=${type}, definition=${definition}}`;
    }
  };
};

export const createConsequence = (id, type, detail) => {
  return { id, type, detail };
};

export const createGroupDefinition = (logic, conditions) => {
  return {
    evaluate: context => {
      switch (logic) {
        case NOT:
          return evaluateNot(context, conditions);
        case AND:
          return evaluateAnd(context, conditions);
        case OR:
          return evaluateOr(context, conditions);
        default:
          return false;
      }
    }
  };
};

export const createMatcherDefinition = (key, matcher, values) => {
  return {
    evaluate: context => {
      const result = MATCHERS[matcher];

      if (!result) {
        return false;
      }

      return result.matches(context, key, values);
    }
  };
};
