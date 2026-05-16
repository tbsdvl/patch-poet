import { CommitMetadataModel } from "./commit-metadata.model";
import { PatchFileModel } from "./patch-file.model";

export interface PatchSetModel {
  readonly commit: CommitMetadataModel;
  readonly files: readonly PatchFileModel[];
  readonly totalAdditions: number;
  readonly totalDeletions: number;
}

