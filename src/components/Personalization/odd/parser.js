/* eslint-disable no-use-before-define */
import {
  createRules,
  createRule,
  createConsequence,
  createCondition,
  createMatcherDefinition,
  createGroupDefinition
} from "./model";

const MATCHER = "matcher";
const GROUP = "group";

const parseMatcherDefinition = json => {
  const { key, matcher, values } = json;

  return createMatcherDefinition(key, matcher, values);
};

const parseGroupDefinition = json => {
  const { logic, conditions } = json;

  return createGroupDefinition(logic, conditions.map(parseCondition));
};

const parseCondition = json => {
  const { type, definition } = json;

  switch (type) {
    case GROUP:
      return createCondition(type, parseGroupDefinition(definition));
    case MATCHER:
      return createCondition(type, parseMatcherDefinition(definition));
    default:
      throw new Error("Can not parse condition");
  }
};

const parseConsequence = json => {
  const { id, type, detail } = json;

  return createConsequence(id, type, detail);
};

const parseRule = json => {
  const { condition, consequences } = json;

  return createRule(
    parseCondition(condition),
    consequences.map(parseConsequence)
  );
};

const parseRules = json => {
  const { version, rules } = json;

  return createRules(version, rules.map(parseRule));
};

export default json => {
  return parseRules(json);
};
