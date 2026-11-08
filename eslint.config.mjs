import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    // localStorage hydration & reel preview intentionally set state in effects.
    // TODO: migrate to useSyncExternalStore / lazy initial state, then restore "error".
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  {
    ignores: [".next/**", "node_modules/**", "test-results/**", "playwright-report/**", "_arsip/**", ".agents/**"],
  },
];

export default eslintConfig;
