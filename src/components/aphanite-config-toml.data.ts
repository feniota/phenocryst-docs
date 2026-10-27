import { defineLoader } from "vitepress";

const FORGEJO_BASE_URL = "https://git.feniota.org/"; // must have a following /
const REPOSITORY = "feniota/aphanite"; // must not have a leading and following /
const FILE_PATH = "src/assets/config.example.toml"; // must not have a leading /
const GIT_REF = "main";

/**
 * Response type of Forgejo v17 `/repos/{owner}/{repo}/contents/{filepath}` API
 *
 * Most fields are omitted.
 */
interface ContentResponse {
  type: "file" | "dir" | "symlink" | "submodule";
  encoding: "base64" | null;
  last_commit_sha: string;
  content: string;
}

export interface AphaniteConfigToml {
  /**
   * The fetched content of `aphanite/src/assets/config.example.toml`
   */
  content: string;

  /**
   * SHA-1 hash of the Git Commit in which the TOML file is last updated
   */
  commit_sha: string;

  /**
   * URL of the file in the specific Git commit
   */
  url: string;
}

declare const data: AphaniteConfigToml;
export { data };

export default defineLoader({
  // type checked loader options
  async load(): Promise<AphaniteConfigToml> {
    const resp = (await (
      await fetch(
        `${FORGEJO_BASE_URL}/api/v1/repos/${REPOSITORY}/contents/${encodeURIComponent(FILE_PATH)}?ref=${encodeURIComponent(GIT_REF)}`,
      )
    ).json()) as ContentResponse;
    if (resp.type === "file" && resp.encoding === "base64") {
      return {
        content: atob(resp.content),
        commit_sha: resp.last_commit_sha,
        // the lack of `encodeURICompont` is intentional, do not add that
        url: `${FORGEJO_BASE_URL}${REPOSITORY}/src/commit/${resp.last_commit_sha}/${FILE_PATH}`,
      };
    } else {
      throw new Error("Forgejo API returned unexpected result");
    }
  },
});
