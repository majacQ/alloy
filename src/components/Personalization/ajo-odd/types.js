const parseFieldRef = fieldRef => {
  return fieldRef.substring(7).split("/");
};

const extract = (xdm, fieldRef) => {
  const paths = parseFieldRef(fieldRef);
  let current = xdm;

  for (let i = 0; i < paths.length; i += 1) {
    const key = paths[i];
    current = current[key];

    if (current === undefined) {
      break;
    }
  }

  return current;
};

// eslint-disable-next-line no-unused-vars
export const constant = (argument, journeyContext) => argument.value;

export const eventFieldRef = (argument, journeyContext) => {
  const { fieldRef = "" } = argument;

  if (fieldRef.length === 0) {
    return undefined;
  }

  const { event } = journeyContext;
  const { xdm } = event;

  return extract(xdm, fieldRef);
};
