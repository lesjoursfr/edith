module.exports = {
  printWidth: 120,
  trailingComma: "es5",
  overrides: [
    {
      files: [".eslintrc.cjs", ".prettierrc.cjs", "*.json", "*.md"],
      options: {
        printWidth: 80,
      },
    },
    {
      files: ["tsconfig.json"],
      options: {
        trailingComma: "none",
      },
    },
  ],
};
