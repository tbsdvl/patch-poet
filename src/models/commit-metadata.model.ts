export interface CommitMetadataModel {
  readonly hash: string;
  readonly shortHash: string;
  readonly branchName: string;
  readonly authorName: string;
  readonly authorEmail: string;
  readonly committedAtIso: string;
  readonly subject: string;
  readonly body: string;
}
