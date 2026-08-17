import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const INLINE_HANDLER_RESTRICTED_SYNTAX = [
  {
    selector:
      "JSXAttribute[name.name=/^on[A-Z]/] JSXExpressionContainer > ArrowFunctionExpression[body.type='BlockStatement']",
    message: "No block-bodied inline handlers in JSX. Extract a named handler.",
  },
  {
    selector:
      "JSXAttribute[name.name=/^on[A-Z]/] JSXExpressionContainer > ArrowFunctionExpression LogicalExpression",
    message:
      "No logical operators (&&/||) inside inline JSX handlers. Extract logic to a function.",
  },
  {
    selector:
      "JSXAttribute[name.name=/^on[A-Z]/] JSXExpressionContainer > ArrowFunctionExpression ConditionalExpression",
    message:
      "No ternary inside inline JSX handlers. Extract logic to a function.",
  },
  {
    selector:
      "JSXAttribute[name.name=/^on[A-Z]/] JSXExpressionContainer > ArrowFunctionExpression SequenceExpression",
    message:
      "No comma operator inside inline JSX handlers. Extract logic to a function.",
  },
  {
    selector:
      "JSXAttribute[name.name=/^on[A-Z]/] > JSXExpressionContainer > ConditionalExpression",
    message:
      "No ternary directly in event handler prop. Precompute handler above.",
  },
  {
    selector:
      "JSXAttribute[name.name=/^on[A-Z]/] > JSXExpressionContainer > LogicalExpression",
    message:
      "No &&/|| directly in event handler prop. Precompute handler above.",
  },
];

const NO_INLINE_COMPARISON_STRING_LITERALS_RESTRICTED_SYNTAX = {
  selector:
    "BinaryExpression[operator=/^(==|===|!=|!==)$/] > Literal[value][raw=/^(['\"]).*\\1$/]",
  message:
    "Do not compare against inline string literals. Extract the value to a const or enum.",
};

const STRICT_FILES = [
  "src/lib/apiStatus.ts",
  "src/features/horses/hooks/useHorsePedigree.ts",
  "src/features/horses/hooks/useHorsesPageHorseActions.ts",
  "src/features/horses/lib/horseSelection.ts",
  "src/features/horses/ui/Horses/HorsePedigreePickerModal.tsx",
  "src/features/horses/ui/Horses/HorsePedigreeCandidateButton.tsx",
  "src/features/horses/ui/Horses/HorsePedigreePickerPagination.tsx",
  "src/features/horses/ui/Horses/horsePedigreePickerModal.styles.ts",
  "src/features/prices/hooks/usePricesPageActions.ts",
  "src/features/gallery/hooks/useGalleryPageUi.ts",
  "src/features/news/hooks/useNewsPageUi.ts",
  "src/features/siteSettings/hooks/useSiteSettings.ts",
  "src/ui/filters/StringFilter.tsx",
  "src/ui/filters/ListFilter.tsx",
  "src/ui/filters/filter.styles.ts",
];

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      sonarjs,
      unicorn,
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      "no-duplicate-imports": "warn",
      "unicorn/no-useless-undefined": "warn",
      "unicorn/prefer-optional-catch-binding": "error",
      "unicorn/no-abusive-eslint-disable": "error",

      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": [
        "error",
        { fixToUnknown: true, ignoreRestArgs: true },
      ],

      "react/no-unescaped-entities": "off",

      "react/jsx-no-bind": [
        "warn",
        {
          allowArrowFunctions: true,
          allowFunctions: false,
          allowBind: false,
          ignoreRefs: true,
        },
      ],

      "no-restricted-syntax": ["warn", ...INLINE_HANDLER_RESTRICTED_SYNTAX],

      "max-lines": [
        "warn",
        { max: 500, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "warn",
        { max: 300, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      "sonarjs/cognitive-complexity": ["warn", 12],
      "unicorn/prefer-logical-operator-over-ternary": "warn",
      "sonarjs/no-identical-functions": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-magic-numbers": [
        "warn",
        {
          ignore: [0, 1],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          enforceConst: true,
          detectObjects: false,
        },
      ],
      "no-restricted-syntax": [
        "warn",
        ...INLINE_HANDLER_RESTRICTED_SYNTAX,
        NO_INLINE_COMPARISON_STRING_LITERALS_RESTRICTED_SYNTAX,
      ],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-magic-numbers": "off",
      "no-restricted-syntax": ["warn", ...INLINE_HANDLER_RESTRICTED_SYNTAX],
    },
  },
  {
    files: STRICT_FILES,
    rules: {
      "no-restricted-syntax": [
        "error",
        ...INLINE_HANDLER_RESTRICTED_SYNTAX,
        NO_INLINE_COMPARISON_STRING_LITERALS_RESTRICTED_SYNTAX,
      ],
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
    },
  },
];

export default eslintConfig;
