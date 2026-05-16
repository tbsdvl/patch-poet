import { ParseGitPatchInputModel } from "../../domain/models/git/git-patch-input.model";
import { PatchFileModel } from "../../domain/models/patch-file.model";

export class GitPatchParser {
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

  private static parseNameStatus(
    value: string
  ): Map<string, PatchFileModel["changeType"]> {
    const result = new Map<string, PatchFileModel["changeType"]>();

    for (const line of value.split("\n")) {
      if (!line.trim()) continue;

      const parts = line.split("\t");
      const status = parts[0];
      const path = parts.at(-1);

      if (!status || !path) continue;

      result.set(path, this.toChangeType(status));
    }

    return result;
  }

  private static parseNumStat(
    value: string
  ): Map<string, { additions: number; deletions: number; isBinary: boolean }> {
    const result = new Map<
      string,
      { additions: number; deletions: number; isBinary: boolean }
    >();

    for (const line of value.split("\n")) {
      if (!line.trim()) continue;

      const [additionsRaw, deletionsRaw, path] = line.split("\t");

      if (!path) continue;

      const isBinary = additionsRaw === "-" || deletionsRaw === "-";

      result.set(path, {
        additions: isBinary ? 0 : Number(additionsRaw),
        deletions: isBinary ? 0 : Number(deletionsRaw),
        isBinary
      });
    }

    return result;
  }

  private static parseUnifiedPatch(value: string): Map<string, string> {
    const result = new Map<string, string>();

    const fileSections = value.split(/^diff --git /gm).filter(Boolean);

    for (const section of fileSections) {
      const normalized = `diff --git ${section}`;
      const match = normalized.match(/^diff --git a\/(.+?) b\/(.+)$/m);

      if (!match) continue;

      const path = match[2];

      if (!path) continue;

      result.set(path, normalized.trimEnd());
    }

    return result;
  }

  private static toChangeType(status: string): PatchFileModel["changeType"] {
    const prefix = status[0];

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
}