import baseConfig from "./eslint.config.mjs";

const eslintAiConfig = [
  ...baseConfig,
  {
    rules: {
      "react/jsx-no-bind": [
        "error",
        {
          allowArrowFunctions: false,
          allowFunctions: false,
          allowBind: false,
          ignoreRefs: true,
        },
      ],
      "sonarjs/cognitive-complexity": ["error", 12],
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
];

export default eslintAiConfig;
