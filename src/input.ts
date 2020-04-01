import {context} from '@actions/github'
import * as core from '@actions/core'
import {GitHubFactory} from './github'

export interface Inputs {
  npmDir: string
  token: string
  headBranch: string
  baseBranch: string
}

export class Input {
  private readonly gitHubFactory: GitHubFactory

  constructor(gitHubFactory: GitHubFactory) {
    this.gitHubFactory = gitHubFactory
  }

  static create(): Input {
    return new Input(new GitHubFactory())
  }

  async getInputs(): Promise<Inputs> {
    let npmDir = core.getInput('npm-directory')
    if (npmDir.length === 0) {
      const workspace = process.env['GITHUB_WORKSPACE']
      if (workspace === undefined) {
        throw new Error('Unable to get GITHUB_WORKSPACE env variable')
      }
      npmDir = workspace
    }
    const token = core.getInput('token')
    const headBranch = core.getInput('head-branch')
    let baseBranch = core.getInput('base-branch')
    if (baseBranch.length === 0) {
      const owner = context.repo.owner
      const repo = context.repo.repo
      const github = this.gitHubFactory.create(token)
      baseBranch = await github.getDefaultBranch(owner, repo)
    }

    return {
      npmDir,
      token,
      headBranch,
      baseBranch
    }
  }
}

export async function getInputs(): Promise<Inputs> {
  return await Input.create().getInputs()
}
