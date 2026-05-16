import { CommitMetadataModel } from "../../domain/models/commit-metadata.model";

export const shouldSkipCommit = (
  commit: CommitMetadataModel,
  skipToken: string = "poet-skip") : boolean => {
    const message = `${commit.subject}\n${commit.body}`.toLowerCase();
    return message.includes(skipToken.toLowerCase());
}