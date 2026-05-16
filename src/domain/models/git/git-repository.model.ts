import { CommitMetadataModel } from "../commit-metadata.model";
import { PatchFileModel } from "../patch-file.model";

export interface GitRepositoryModel {
  getCommitMetadata(commitRef: string): Promise<CommitMetadataModel>;
  getChangedFiles(commitRef: string): Promise<readonly PatchFileModel[]>;
  getCurrentBranch(): Promise<string>;
}