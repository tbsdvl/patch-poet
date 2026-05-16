import { PatchPoetConfigModel } from "../models/patch-poet-config.model";

export const defaultConfig: PatchPoetConfigModel = {
  useModel: false,

  summaryOptions: {
    writeToLocal: true,
    outputDirectory: "patch-poet"
  },

  defaultBranchOptions: {
    name: "main"
  },

  gitOptions: {
    skipToken: "poet-skip",
    includeDiffStats: true,
    includeFilePatches: true,
    maxPatchChars: 250_000,
    ignoredPaths: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".git/**",
      "patch-poet/**",
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock"
    ]
  }
};