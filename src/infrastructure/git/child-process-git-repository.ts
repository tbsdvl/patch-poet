import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { CommitMetadataModel } from "../../domain/models/commit-metadata.model";
import { PatchFileModel } from "../../domain/models/patch-file.model";
import { GitPatchParser } from "./git-patch-parser";
import { GitRepositoryModel } from "../../domain/models/git/git-repository.model";

const execFileAsync = promisify(execFile);

export class ChildProcessGitRepository implements GitRepositoryModel {

  private readonly format: string = [
      "%H",
      "%h",
      "%an",
      "%ae",
      "%cI",
      "%s",
      "%b"
    ].join("%x1f");

  public constructor(private readonly cwd: string) {}

  public async getCurrentBranch(): Promise<string> {
    const { stdout } = await this.git(["rev-parse", "--abbrev-ref", "HEAD"]);
    return stdout.trim();
  }

  public async getCommitMetadata(commitRef: string): Promise<CommitMetadataModel> {

    const { stdout } = await this.git([
      "show",
      "--quiet",
      `--format=${this.format}`,
      commitRef
    ]);

    const [hash, shortHash, authorName, authorEmail, committedAtIso, subject, body] =
      stdout.split("\x1f");

    const branchName = await this.getCurrentBranch();

    return {
      hash: hash?.trim() ?? "",
      shortHash: shortHash?.trim() ?? "",
      branchName,
      authorName: authorName?.trim() ?? "",
      authorEmail: authorEmail?.trim() ?? "",
      committedAtIso: committedAtIso?.trim() ?? "",
      subject: subject?.trim() ?? "",
      body: body?.trim() ?? ""
    };
  }

  public async getChangedFiles(commitRef: string): Promise<readonly PatchFileModel[]> {
    const nameStatus = await this.git([
      "show",
      "--name-status",
      "--format=",
      commitRef
    ]);

    const diffStats = await this.git([
      "show",
      "--numstat",
      "--format=",
      commitRef
    ]);

    const patch = await this.git([
      "show",
      "--format=",
      "--find-renames",
      "--find-copies",
      "--unified=80",
      commitRef
    ]);

    return GitPatchParser.parse({
      nameStatus: nameStatus.stdout,
      numStat: diffStats.stdout,
      patch: patch.stdout
    });
  }

  private async git(args: readonly string[]): Promise<{ stdout: string; stderr: string }> {
    return execFileAsync("git", [...args], {
      cwd: this.cwd,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 32,
      timeout: 30_000 // make these constants
    });
  }
}