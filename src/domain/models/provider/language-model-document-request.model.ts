import { SummaryKindType } from "../../types/summary-kind.type";

export interface LanguageModelDocumentRequestModel {
  readonly modelName: string;
  readonly summaryKind: SummaryKindType;
  readonly sourceMarkdownDocuments: readonly string[];
  readonly instructions: string;
}
