import {CommandExecutor} from './exec'

export interface GitResult {
  // trimmed stdout
  stdout: string
  // trimmed stderr
  stderr: string
  // exit code
  exitCode: number
}

export interface GitConfigParameter {
  name: string
  value: string
}

export class Git {
  private readonly executor: CommandExecutor
  private configParams: GitConfigParameter[]

  constructor(executor: CommandExecutor) {
    this.executor = executor
    this.configParams = []
  }

  static create(): Git {
    return new Git(CommandExecutor.create())
  }

  private gitCommand(): string {
    let command = 'git'
    for (const param of this.configParams) {
      command += ` -c ${param.name}="${param.value}"`
    }
    return command
  }

  setConfigParameters(configParams: GitConfigParameter[]): void {
    this.configParams = configParams
  }

  async getCurrentBranch(): Promise<string> {
    return (
      await this.executor.execute(
        `${this.gitCommand()} symbolic-ref HEAD --short`
      )
    ).stdout.trim()
  }

  async diff(): Promise<GitResult> {
    return await this.executor.execute(`${this.gitCommand()} diff`)
  }

  async fetch(branch: string): Promise<GitResult> {
    return await this.executor.execute(
      `${this.gitCommand()} fetch --force origin ${branch}:${branch}`
    )
  }

  async checkoutBranch(branch: string, startPoint: string): Promise<GitResult> {
    return await this.executor.execute(
      `${this.gitCommand()} checkout -B ${branch} ${startPoint}`
    )
  }

  async addAll(): Promise<GitResult> {
    return await this.executor.execute(`${this.gitCommand()} add -A`)
  }

  async commit(message: string): Promise<GitResult> {
    return await this.executor.execute(
      `${this.gitCommand()} commit -m "${message}"`
    )
  }

  async pushForce(branch: string): Promise<GitResult> {
    return await this.executor.execute(
      `${this.gitCommand()} push --force origin ${branch}`
    )
  }
}
