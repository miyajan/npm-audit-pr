import * as exec from '@actions/exec'
import {StringStream} from './stringstream'
import * as os from 'os'
import * as stream from 'stream'

export interface ExecResult {
  // trimmed stdout
  stdout: string
  // trimmed stderr
  stderr: string
  // exit code
  exitCode: number
}

interface ExecOptions {
  // Optional working directory. Defaults to current
  cwd?: string
  // Optional out stream to use. Defaults to process.stdout
  outStream: stream.Writable
  // Optional err stream to use. Defaults to process.stderr
  errStream: stream.Writable
  // Optional. Defaults to failing on non zero. Ignore will not fail leaving it up to the caller
  ignoreReturnCode: boolean
}

type ExecFunc = (
  commandLine: string,
  args?: string[],
  options?: ExecOptions
) => Promise<number>

export class CommandExecutor {
  private readonly exec: ExecFunc

  constructor(execFunc: ExecFunc) {
    this.exec = execFunc
  }

  static create(): CommandExecutor {
    return new CommandExecutor(exec.exec)
  }

  async execute(commandLine: string, cwd?: string): Promise<ExecResult> {
    const outStream = new StringStream()
    const errStream = new StringStream()
    const options: ExecOptions = {
      outStream,
      errStream,
      ignoreReturnCode: true
    }
    if (cwd !== undefined) {
      options.cwd = cwd
    }
    const exitCode = await this.exec(commandLine, undefined, options)
    const outContents = outStream.getContents()

    // delete the first line because @actions/exec writes "[command]<commandLine>"
    const stdout = outContents
      .substring(outContents.indexOf(os.EOL) + os.EOL.length)
      .trim()

    const stderr = errStream.getContents().trim()
    return {
      stdout,
      stderr,
      exitCode
    }
  }
}

export async function execute(
  commandLine: string,
  cwd?: string
): Promise<ExecResult> {
  const executor = CommandExecutor.create()
  return await executor.execute(commandLine, cwd)
}
