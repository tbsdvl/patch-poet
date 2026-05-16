export interface LanguageModelChunkResponseModel {
  readonly markdown: string;
  readonly tokenUsage?: {
    readonly inputTokens?: number;
    readonly outputTokens?: number;
  };
}

