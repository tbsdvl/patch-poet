import { ParseGitPatchInputModel } from "../../domain/models/git/git-patch-input.model";
import { PatchFileModel } from "../../domain/models/patch-file.model";

export class GitPatchParser {

  /**
   * Parses the name status information from the given value and returns a map of file paths to their corresponding change types.
   * @param {string} value The name status information from the Git patch.
   * @returns {Map<string, PatchFileModel["changeType"]>} A map of file paths to their corresponding change types.
   */
  private static parseNameStatus(
    value: string
  ): Map<string, PatchFileModel["changeType"]> {
    const result = new Map<string, PatchFileModel["changeType"]>();

    for (const line of value.split("\n")) {
      if (!line.trim()) {
        continue;
      }

      const parts = line.split("\t");
      const status = parts[0];
      const path = parts.at(-1);

      if (!status || !path) {
        continue;
      }

      result.set(path, this.convertToChangeType(status));
    }

    return result;
  }

  /**
   * Parses the num stat information from the given value and returns a map of file paths to their corresponding additions, deletions, and binary status.
   * @param {string} value The num stat information from the Git patch.
   * @returns {Map<string, { additions: number; deletions: number; isBinary: boolean }>} A map of file paths to their corresponding additions, deletions, and binary status.
   */
  private static parseNumStat(
    value: string
  ): Map<string, { additions: number; deletions: number; isBinary: boolean }> {
    const result = new Map<string,
      {
        additions: number;
        deletions: number;
        isBinary: boolean
      }
    >();

    for (const line of value.split("\n")) {
      if (!line.trim()) {
        continue;
      }

      const [additionsRaw, deletionsRaw, path] = line.split("\t");

      if (!path) {
        continue;
      }

      const isBinary = additionsRaw === "-" || deletionsRaw === "-";

      result.set(path, {
        additions: isBinary ? 0 : Number(additionsRaw),
        deletions: isBinary ? 0 : Number(deletionsRaw),
        isBinary
      });
    }

    return result;
  }

  /**
   * Parses the unified patch information from the given value and returns a map of file paths to their corresponding patch content.
   * @param {string} value The unified patch information from the Git patch.
   * @returns {Map<string, string>} A map of file paths to their corresponding patch content.
   */
  private static parseUnifiedPatch(value: string): Map<string, string> {
    const result = new Map<string, string>();

    const fileSections = value.split(/^diff --git /gm).filter(Boolean);

    for (const section of fileSections) {
      const normalized = `diff --git ${section}`;
      const match = normalized.match(/^diff --git a\/(.+?) b\/(.+)$/m);

      if (!match) {
        continue;
      }

      const path = match[2];

      if (!path) {
        continue;
      }

      result.set(path, normalized.trimEnd());
    }

    return result;
  }

  /**
   * Converts the given Git status code to the corresponding change type.
   * @param {string} status The Git status code (e.g., "A", "M", "D", "R", "C").
   * @returns {PatchFileModel["changeType"]} The corresponding change type for the given Git status code.
   */
  private static convertToChangeType(status: string): PatchFileModel["changeType"] {
    const prefix = status[0];

    // TODO: Make these constants. Maybe move them to a separate file. Maybe make them configurable.
    // TODO: Handle the other status codes (e.g., "T" for type change, "U" for unmerged, "X" for unknown, etc.). Maybe also handle the lowercase status codes for copied/renamed with conflicts.
    switch (prefix) {
      case "A":
        return "added";
      case "M":
        return "modified";
      case "D":
        return "deleted";
      case "R":
        return "renamed";
      case "C":
        return "copied";
      default:
        return "unknown";
    }
  }

  /**
   * Parses the Git patch data from the given input and returns an array of objects representing the changed files, including the file path, change type (added, modified, deleted, renamed, or copied), number of additions and deletions,
   * patch content, and whether the file is binary.
   * @param {ParseGitPatchInputModel} input The input data containing the name status, num stat, and unified patch information for the commit.
   * @returns {readonly PatchFileModel[]} An array of objects representing the changed files.
   */
  public static parse(input: ParseGitPatchInputModel): readonly PatchFileModel[] {
    const statusByPath = this.parseNameStatus(input.nameStatus);
    const statsByPath = this.parseNumStat(input.numStat);
    const patchesByPath = this.parseUnifiedPatch(input.patch);

    const paths = new Set<string>([
      ...statusByPath.keys(),
      ...statsByPath.keys(),
      ...patchesByPath.keys()
    ]);

    return [...paths].map(path => {
      const stats = statsByPath.get(path);

      return {
        path,
        changeType: statusByPath.get(path) ?? "unknown",
        additions: stats?.additions ?? 0,
        deletions: stats?.deletions ?? 0,
        patch: patchesByPath.get(path) ?? "",
        isBinary: stats?.isBinary ?? false
      };
    });
  }
}