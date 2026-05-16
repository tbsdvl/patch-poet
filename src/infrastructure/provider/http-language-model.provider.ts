import { LanguageModelChunkRequestModel } from "../../domain/models/provider/language-model-chunk-request.model";
import { LanguageModelChunkResponseModel } from "../../domain/models/provider/language-model-chunk-response.model";
import { LanguageModelDocumentRequestModel } from "../../domain/models/provider/language-model-document-request.model";
import { LanguageModelDocumentResponseModel } from "../../domain/models/provider/language-model-document-response.model";
import { LanguageModelProviderModel } from "../../domain/models/provider/language-model-provider.model";

export class HttpLanguageModelProvider implements LanguageModelProviderModel {

  /**
   * Initializes a new instance of the HttpLanguageModelProvider class.
   * @param options
   */
  public constructor(
    private readonly options: {
      readonly name: string;
      readonly url: string;
      readonly timeoutMs: number;
      readonly headers?: Record<string, string>;
      readonly maxOutputChars: number;
    }
  ) {}

  /**
   * Summarizes a commit chunk by sending a request to the HTTP model provider endpoint.
   * @param {LanguageModelChunkRequestModel} request
   * @returns A promise that resolves to a LanguageModelChunkResponseModel containing the summary of the commit chunk.
   */
  public async summarizeCommitChunk(
    request: LanguageModelChunkRequestModel
  ): Promise<LanguageModelChunkResponseModel> {
    const response = await fetch(this.options.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...this.options.headers
      },
      body: JSON.stringify({
        task: "patch-poet.commit-chunk-summary",
        model: this.options.name,
        input: request
      }),
      signal: AbortSignal.timeout(this.options.timeoutMs)
    });

    if (!response.ok) {
      throw new Error(`Model provider failed with HTTP ${response.status}`);
    }

    const text = await response.text();

    // TODO: Create the ModelResponseParser
    return {
      // markdown: ModelResponseParser.toMarkdown(text, {
      //   maxOutputChars: this.options.maxOutputChars
      // })
    } as LanguageModelChunkResponseModel;
  }

  /**
   * Summarizes a list of documents by sending a request to the HTTP model provider endpoint.
   * @param {LanguageModelDocumentRequestModel} request
   * @returns A promise that resolves to a LanguageModelDocumentResponseModel containing the summary of the documents.
   */
  public async summarizeDocuments(
    request: LanguageModelDocumentRequestModel
  ): Promise<LanguageModelDocumentResponseModel> {
    const response = await fetch(this.options.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...this.options.headers
      },
      body: JSON.stringify({
        task: "patch-poet.document-summary",
        model: this.options.name,
        input: request
      }),
      signal: AbortSignal.timeout(this.options.timeoutMs)
    });

    if (!response.ok) {
      throw new Error(`Model provider failed with HTTP ${response.status}`);
    }

    // TODO: Create the ModelResponseParser
    return {
      // markdown: ModelResponseParser.toMarkdown(await response.text(), {
      //   maxOutputChars: this.options.maxOutputChars
      // })
    } as LanguageModelDocumentResponseModel;
  }
}