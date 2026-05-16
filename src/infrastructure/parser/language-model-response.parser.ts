import { LanguageModelResponseParserModelOptionsModel } from "../../domain/models/parser/language-model-response-parser-options.model";

export class LanguageModelResponseParser {
  public static toMarkdown(text: string, options?: LanguageModelResponseParserModelOptionsModel): string {
    if (options?.maxOutputChars && text.length > options.maxOutputChars) {
      text = text.substring(0, options.maxOutputChars);
    }

    return text;
  }
}