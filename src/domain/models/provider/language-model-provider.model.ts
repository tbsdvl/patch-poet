import { LanguageModelChunkRequestModel } from "./language-model-chunk-request.model";
import { LanguageModelChunkResponseModel } from "./language-model-chunk-response.model";
import { LanguageModelDocumentRequestModel } from "./language-model-document-request.model";
import { LanguageModelDocumentResponseModel } from "./language-model-document-response.model";

export interface LanguageModelProviderModel {
  summarizeCommitChunk(request: LanguageModelChunkRequestModel): Promise<LanguageModelChunkResponseModel>;
  summarizeDocuments(request: LanguageModelDocumentRequestModel): Promise<LanguageModelDocumentResponseModel>;
}