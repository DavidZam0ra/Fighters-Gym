// @ts-check
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**"],
  },
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
  },
  {
    // Default rule for the whole app: nobody may import the generated Prisma
    // client directly. Only the db adapters (next block) are exempted.
    // This is what keeps Prisma's generated types from leaking past the
    // infrastructure layer into use-cases or the domain.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@prisma/client",
              message:
                "Import @prisma/client only inside infrastructure/adapters/db/ — everywhere else, depend on the repository ports in application/ports/out instead.",
            },
          ],
        },
      ],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/infrastructure/adapters/db/**/*.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    // scripts/ son utilidades de desarrollo puntuales (sembrado de datos de
    // carga, limpieza…), no parte de la app desplegada — no sujetas al
    // límite arquitectónico de @prisma/client.
    files: ["scripts/**/*.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  }
);
