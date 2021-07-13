export const and = (first, second) => {
  return first && second;
};

export const or = (first, second) => {
  return first || second;
};

export const not = first => {
  return !first;
};

export const equal = (first, second) => {
  return first === second;
};

export const notEqual = (first, second) => {
  return first !== second;
};

export const isNull = first => {
  return first === null;
};

export const isNotNull = first => {
  return first !== null;
};
