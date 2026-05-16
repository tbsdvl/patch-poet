import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { CommitMetadataModel } from "../../domain/models/commit-metadata.model";
import { PatchFileModel } from "../../domain/models/patch-file.model";
import { GitPatchParser } from "./git-patch.parser";
import { GitRepositoryModel } from "../../domain/models/git/git-repository.model";

const execFileAsync = promisify(execFile);

export class ChildProcessGitRepository implements GitRepositoryModel {

  private readonly patchFormat: string = [
      "%H",
      "%h",
      "%an",
      "%ae",
      "%cI",
      "%s",
      "%b"
    ].join("%x1f");

  public constructor(
    private readonly cwd: string
  ) {}

  /**
    Executes a Git command with the given arguments and returns the stdout and stderr as strings.
    @param {string[]} args The arguments to pass to the Git command.
    @returns An object containing the stdout and stderr of the Git command.
  */
  // TODO: Make the numbers constants.
  // Maybe move them to a separate file.
  // Maybe make them configurable.
  private async git(args: readonly string[]): Promise<{ stdout: string; stderr: string }> {
    return execFileAsync("git", [...args], {
      cwd: this.cwd,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 32,
      timeout: 30_000
    });
  }

  /**
    Gets the current branch name from the HEAD file.
    @returns The name of the current branch.
  */
  // TODO: This is a bit of a hack. It would be better to use the Git command to get the current branch name.
  public async getCurrentBranch(): Promise<string> {
    const { stdout } = await this.git(["rev-parse", "--abbrev-ref", "HEAD"]);
    return stdout.trim();
  }


  /**
    Gets the commit data for the given commit reference.
    The commit reference can be a commit hash, a branch name, or any other valid Git reference.
    The method returns an object containing the commit metadata, including the full hash, short hash,
    branch name, author name, author email, committed date in ISO format, subject, and body of the commit message.
    @param {string} commitRef The Git reference for the commit (e.g., commit hash, branch name).
    @returns {Promise<CommitMetadataModel>} A promise that containing the commit metadata.
  */
  // TODO: This method is doing a lot. It might be better to split it into multiple methods.
  public async getCommitMetadata(commitRef: string): Promise<CommitMetadataModel> {
    const { stdout } = await this.git([
      "show",
      "--quiet",
      `--format=${this.patchFormat}`,
      commitRef
    ]);

    const [
      hash,
      shortHash,
      authorName,
      authorEmail,
      committedAtIso,
      subject,
      body
    ] = stdout.split("\x1f");

    const branchName = await this.getCurrentBranch();

    // TODO: remove the nullish coalescing to empty strings. This is gross.
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

  /**
   * Gets the changed files for the given commit reference.
   * The method returns an array of objects representing the changed files, including the file path,
   * change type (added, modified, deleted, renamed, or copied), number of additions and deletions,
   * @param {string} commitRef The Git reference for the commit (e.g., commit hash, branch name).
   * @returns An array of objects representing the changed files.
  */
  public async getChangedFiles(commitRef: string): Promise<readonly PatchFileModel[]> {
    // TODO: Make the arguments to the Git commands constants. Maybe move them to a separate file. Maybe make them configurable.
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
}