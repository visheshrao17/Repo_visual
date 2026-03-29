import axios, { AxiosInstance } from "axios";
import { env } from "../config/env";
import { withRetry } from "../utils/retry";

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  timeout: 15000,
  headers: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  }
});

const getClient = (accessToken: string): AxiosInstance => {
  const client = githubApi;
  client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  return client;
};

export const githubService = {
  exchangeCodeForToken: async (code: string): Promise<string> => {
    const response = await withRetry(() =>
      axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: env.GITHUB_REDIRECT_URI
        },
        {
          headers: {
            Accept: "application/json"
          }
        }
      )
    );

    if (!response.data?.access_token) {
      throw new Error("Failed to exchange code for GitHub access token");
    }

    return response.data.access_token;
  },

  getUser: async (accessToken: string) => {
    const client = getClient(accessToken);

    const response = await withRetry(() => client.get("/user"));
    return response.data;
  },

  getRepos: async (accessToken: string, page = 1, perPage = 50) => {
    const client = getClient(accessToken);

    const response = await withRetry(() =>
      client.get("/user/repos", {
        params: {
          page,
          per_page: perPage,
          sort: "updated"
        }
      })
    );

    return response.data;
  },

  getWorkflows: async (owner: string, repo: string, accessToken: string, page = 1, perPage = 50) => {
    const client = getClient(accessToken);

    const response = await withRetry(() =>
      client.get(`/repos/${owner}/${repo}/actions/workflows`, {
        params: { page, per_page: perPage }
      })
    );

    return response.data;
  },

  getWorkflowRuns: async (owner: string, repo: string, accessToken: string, page = 1, perPage = 50) => {
    const client = getClient(accessToken);

    const response = await withRetry(() =>
      client.get(`/repos/${owner}/${repo}/actions/runs`, {
        params: { page, per_page: perPage }
      })
    );

    return response.data;
  },

  getJobs: async (owner: string, repo: string, runId: string, accessToken: string) => {
    const client = getClient(accessToken);

    const response = await withRetry(() =>
      client.get(`/repos/${owner}/${repo}/actions/runs/${runId}/jobs`)
    );

    return response.data;
  },

  triggerWorkflow: async (
    owner: string,
    repo: string,
    workflowId: string,
    branch: string,
    accessToken: string
  ) => {
    const client = getClient(accessToken);

    await withRetry(() =>
      client.post(`/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`, {
        ref: branch
      })
    );
  },

  downloadLogs: async (owner: string, repo: string, runId: string, accessToken: string) => {
    const client = getClient(accessToken);

    const response = await withRetry(() =>
      client.get(`/repos/${owner}/${repo}/actions/runs/${runId}/logs`, {
        responseType: "arraybuffer",
        maxRedirects: 5
      })
    );

    return Buffer.from(response.data);
  }
};
