// @ts-check
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", ".next/**", "out/**"] },
  ...tseslint.configs.recommended,
  {
    // Fija explícitamente la raíz en vez de dejar que typescript-eslint la
    // infiera del call stack: en un monorepo, si el proceso de ESLint del
    // editor carga los eslint.config.js de varios paquetes (api, landing,
    // panel) en el mismo proceso, esa inferencia encuentra más de un
    // candidato y lanza "multiple candidate TSConfigRootDirs".
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
