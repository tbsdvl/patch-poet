import { ResponseFormatType } from "../types/response-format.type";

export interface PatchPoetConfigModel {
  readonly useModel: boolean;

  readonly modelOptions?: {
    readonly name: string;
    readonly url: string;
    readonly timeoutMs: number;
    readonly headers: Record<string, string>;
    readonly maxInputCharsPerChunk: number;
    readonly maxOutputChars: number;
    readonly responseFormat: ResponseFormatType;
  };

  readonly summaryOptions: {
    readonly writeToLocal: boolean;
    readonly outputDirectory?: string;
    readonly remoteStorageUrl?: string;
    readonly token?: string;
  };

  readonly defaultBranchOptions: {
    readonly name: string;
  };

  readonly gitOptions?: {
    readonly skipToken?: string;
    readonly includeDiffStats?: boolean;
    readonly includeFilePatches?: boolean;
    readonly maxPatchChars: number;
    readonly ignoredPaths: string[];
  };
}
