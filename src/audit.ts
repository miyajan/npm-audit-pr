import {CommandExecutor} from './exec'

export interface AuditResult {
  // trimmed stdout
  stdout: string
  // trimmed stderr
  stderr: string
  // exit code
  exitCode: number
}

export class Audit {
  private readonly executor: CommandExecutor

  constructor(executor: CommandExecutor) {
    this.executor = executor
  }

  static create(): Audit {
    return new Audit(CommandExecutor.create())
  }

  async audit(directory: string): Promise<AuditResult> {
    return await this.executor.execute('npm audit', directory)
  }

  async fix(directory: string): Promise<AuditResult> {
    return await this.executor.execute('npm audit fix', directory)
  }
}
