import {context} from '@actions/github'
import * as core from '@actions/core'
import * as strings from './strings'
import * as input from './input'
import {Audit} from './audit'
import {Git} from './git'
import {GitHub} from './github'

export async function run(): Promise<void> {
  try {
    const inputs = await input.getInputs()
    const owner = context.repo.owner
    const repo = context.repo.repo
    const token = inputs.token
    const headBranch = inputs.headBranch
    const baseBranch = inputs.baseBranch
    const audit = Audit.create()
    const github = GitHub.create(token)
    const git = Git.create()
    const basicCredential = strings.base64Encode(token)
    git.setConfigParameters([
      {
        name: 'http.https://github.com/.extraheader',
        value: `AUTHORIZATION: basic ${basicCredential}`
      },
      {
        name: 'user.name',
        value: 'github-actions[bot]'
      },
      {
        name: 'user.email',
        value: 'github-actions[bot]@users.noreply.github.com'
      }
    ])

    const auditResult = await audit.audit(inputs.npmDir)
    if (auditResult.exitCode === 0) {
      core.info('no vulnerabilities found')
      return
    }

    const fixResult = await audit.fix(inputs.npmDir)
    if (fixResult.exitCode !== 0) {
      throw new Error(
        `Error: npm audit fix failed: ${JSON.stringify(fixResult)}`
      )
    }

    if (!(await hasDiff(git))) {
      throw new Error(
        `Error: vulnerabilities were found but they couldn't be fixed automatically\n${fixResult.stdout}`
      )
    }

    await createOrUpdateBranch(git, baseBranch, headBranch)

    const title = 'npm audit fix by npm-audit-pr action'
    const body = `npm audit
\`\`\`
${auditResult.stdout}
\`\`\`
npm audit fix
\`\`\`
${fixResult.stdout}
\`\`\`
`
    const prNumber = await github.createOrUpdatePullRequest(
      owner,
      repo,
      baseBranch,
      headBranch,
      title,
      body
    )
    core.info(`fixed by pull request ${prNumber}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function hasDiff(git: Git): Promise<boolean> {
  const result = await git.diff()
  return result.stdout.length > 0
}

async function createOrUpdateBranch(
  git: Git,
  baseBranch: string,
  headBranch: string
): Promise<void> {
  core.debug(`git symbolic-ref HEAD --short`)
  const currentBranch = await git.getCurrentBranch()

  if (currentBranch !== baseBranch) {
    core.debug(`git fetch --force origin ${baseBranch}:${baseBranch}`)
    const gitFetchResult = await git.fetch(baseBranch)
    if (gitFetchResult.exitCode !== 0) {
      throw new Error(
        `Error: git fetch ${baseBranch} failed: ${JSON.stringify(
          gitFetchResult
        )}`
      )
    }
  }

  core.debug(`git checkout -B ${headBranch} ${baseBranch}`)
  const gitCheckoutResult = await git.checkoutBranch(headBranch, baseBranch)
  if (gitCheckoutResult.exitCode !== 0) {
    throw new Error(
      `Error: git checkout ${headBranch} failed: ${JSON.stringify(
        gitCheckoutResult
      )}`
    )
  }

  core.debug('git add -A')
  const gitAddAllResult = await git.addAll()
  if (gitAddAllResult.exitCode !== 0) {
    throw new Error(`Error: git add failed: ${JSON.stringify(gitAddAllResult)}`)
  }

  const message = '[npm-audit-pr] npm audit fix'
  core.debug(`git commit -m "${message}"`)
  const gitCommitResult = await git.commit(message)
  if (gitCommitResult.exitCode !== 0) {
    throw new Error(
      `Error: git commit failed: ${JSON.stringify(gitCommitResult)}`
    )
  }

  core.debug(`git push --force origin ${headBranch}`)
  const gitPushResult = await git.pushForce(headBranch)
  if (gitPushResult.exitCode !== 0) {
    throw new Error(`Error: git push failed: ${JSON.stringify(gitPushResult)}`)
  }
}
