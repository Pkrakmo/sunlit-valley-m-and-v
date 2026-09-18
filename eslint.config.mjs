import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "script" } },
  { languageOptions: { globals: globals.browser } },
  {
    files: ["scripts/**/*.js", "test/**/*.js"],
    languageOptions: { globals: globals.node },
  },
  pluginJs.configs.recommended,
  {
    files: ["kubejs/**/*.js"],
    rules: {
      // KubeJS and Forge inject these APIs while loading the corresponding scripts.
      "no-undef": "off",
      // Event callbacks are invoked by KubeJS/Forge with a fixed argument list.
      "no-unused-vars": "off",
    },
  },
];
