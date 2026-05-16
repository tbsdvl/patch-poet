import { CommitMetadataModel } from "../../domain/models/commit-metadata.model";

/**
 * Determines whether a commit should be skipped based on a skip token.
 * @param {CommitMetadataModel} commit The commit metadata.
 * @param {string} skipToken The token to look for in the commit message to determine if it should be skipped.
 * @returns {boolean} True if the commit should be skipped, false otherwise.
 */
export const shouldSkipCommit = (
  commit: CommitMetadataModel,
  skipToken: string = "poet-skip") : boolean => {
    const message = `${commit.subject}\n${commit.body}`.toLowerCase();
    return message.includes(skipToken.toLowerCase());
}