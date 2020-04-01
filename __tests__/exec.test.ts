import * as exec from '../src/exec'
import {ExecResult} from '../src/exec'

describe('CommandExecutor', () => {
  describe('execute', () => {
    describe('should execute command line and return result', () => {
      test('when command succeeds', async () => {
        const sut = exec.CommandExecutor.create()
        const result = await sut.execute('echo hoge')

        const expected: ExecResult = {
          stdout: 'hoge',
          stderr: '',
          exitCode: 0
        }
        expect(result).toEqual(expected)
      })

      test('when command fails', async () => {
        const sut = exec.CommandExecutor.create()
        const result = await sut.execute('ls missing-file')
        expect(result.stdout).toContain('No such file or directory')
        expect(result.stderr).toBe('')
        expect(result.exitCode).not.toBe(0)
      })
    })
  })
})
