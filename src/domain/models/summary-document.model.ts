import { SummaryKindType } from "../types/summary-kind.type";

export interface SummaryDocumentModel {
  readonly kind: SummaryKindType;
  readonly branchName: string;
  readonly commitHash?: string;
  readonly title: string;
  readonly markdown: string;
  readonly createdAtIso: string;
}
