module.exports = {
  rules: {
    // The eslintrc in the base directory turns this rule off.
    // We want to turn it back on for the src directory.
    "import/no-extraneous-dependencies": "error",
    "ban/ban": [
      "error",
      {
        name: ["JSON", "stringify"],
        message: "Use src/utils/jsonStringify instead"
      },
      { name: ["Object", "keys"], message: "Use src/utils/objectKeys instead" }
    ],
    "no-restricted-globals": [
      "error",
      {
        name: "window",
        message: "Use src/utils/window instead"
      },
      {
        name: "document",
        message: "Use src/utils/document instead"
      }
    ]
  },
  globals: {
    turbine: "readonly"
  }
};
