import isEmptyObject from "../../../utils/isEmptyObject";

export const RULES = "ajo-odd-rules";

export const hasItem = key => {
  const data = localStorage.getItem(key);

  return data !== null && !isEmptyObject(data);
};

export const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getItem = key => {
  const value = localStorage.getItem(key);

  if (value === null) {
    return {};
  }

  return JSON.parse(value);
};
