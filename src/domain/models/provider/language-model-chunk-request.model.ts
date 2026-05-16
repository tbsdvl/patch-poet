import { CommitMetadataModel } from "../commit-metadata.model";
import { PatchFileModel } from "../patch-file.model";

export interface LanguageModelChunkRequestModel {
  readonly modelName: string;
  readonly commit: CommitMetadataModel;
  readonly chunkIndex: number;
  readonly totalChunks: number;
  readonly files: readonly PatchFileModel[];
  readonly instructions: string;
}
