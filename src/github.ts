import * as github from '@actions/github'
import {Octokit} from '@octokit/rest'

export class GitHub {
  private readonly octokit: github.GitHub

  constructor(octokit: github.GitHub) {
    this.octokit = octokit
  }

  static create(token: string): GitHub {
    const octokit = new github.GitHub(token)
    return new GitHub(octokit)
  }

  async getDefaultBranch(owner: string, repo: string): Promise<string> {
    const params: Octokit.ReposGetParams = {
      owner,
      repo
    }
    const response = await this.octokit.repos.get(params)
    return response.data.default_branch
  }

  async createOrUpdatePullRequest(
    owner: string,
    repo: string,
    baseBranch: string,
    headBranch: string,
    title: string,
    body: string
  ): Promise<number> {
    const listParams: Octokit.PullsListParams = {
      owner,
      repo,
      base: baseBranch,
      head: headBranch,
      state: 'open'
    }
    const listPullRequestResponse = await this.octokit.pulls.list(listParams)
    if (listPullRequestResponse.data.length === 0) {
      // create pull request
      const params: Octokit.PullsCreateParams = {
        owner,
        repo,
        base: baseBranch,
        head: headBranch,
        title,
        body
      }
      const response = await this.octokit.pulls.create(params)
      return response.data.number
    } else {
      // update pull request
      const pullRequest = listPullRequestResponse.data[0]
      const params: Octokit.PullsUpdateParams = {
        owner,
        repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_number: pullRequest.number,
        title,
        body
      }
      const response = await this.octokit.pulls.update(params)
      return response.data.number
    }
  }
}

export class GitHubFactory {
  create(token: string): GitHub {
    return GitHub.create(token)
  }
}
