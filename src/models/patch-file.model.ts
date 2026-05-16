import { PatchChangeType } from "../types/patch-change.type";

export interface PatchFileModel {
  readonly path: string;
  readonly changeType: PatchChangeType;
  readonly additions: number;
  readonly deletions: number;
  readonly patch?: string;
  readonly isBinary: boolean;
}
