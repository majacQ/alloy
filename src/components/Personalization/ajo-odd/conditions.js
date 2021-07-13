import * as types from "./types";
import dataTypes from "./dataTypes";
import * as functions from "./functions";

const evaluateArgument = (argument, journeyContext) => {
  const { type, dataType } = argument;
  const dataTypeConverter = dataTypes[dataType];
  const typeEval = types[type];

  if (typeEval === undefined || dataTypeConverter === undefined) {
    return undefined;
  }

  if (type === "function") {
    const { function: name, args = [] } = argument;

    // eslint-disable-next-line no-use-before-define
    return evaluateFunction(name, args, journeyContext);
  }

  return dataTypeConverter(typeEval(argument, journeyContext));
};

const evaluateFunction = (name, args, journeyContext) => {
  const argsCount = args.length;
  const parameters = args
    .map(e => evaluateArgument(e, journeyContext))
    .filter(e => e !== undefined);

  if (parameters.length < argsCount) {
    return undefined;
  }

  const func = functions[name];

  if (func === undefined) {
    return undefined;
  }

  return func(...parameters);
};

export default (condition, journeyContext) => {
  const { function: name, args = [] } = condition;

  if (name === undefined || args.length === 0) {
    return false;
  }

  return Boolean(evaluateFunction(name, args, journeyContext));
};
