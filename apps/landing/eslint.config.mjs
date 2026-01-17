import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,astro}'],
    rules: {
      // Desactiva reglas que puedan causar problemas con Astro
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    // Ignora directorios de build
    ignores: ['dist/', '.astro/', 'node_modules/'],
  },
];
