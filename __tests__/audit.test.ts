import * as audit from '../src/audit'
import * as fs from 'fs'

describe('Audit', () => {
  describe('fix runs "npm audit fix" and returns result', () => {
    test('when there are no vulnerabilities', async () => {
      const tmpDir = fs.mkdtempSync('audit')
      try {
        const currentDir = __dirname
        fs.copyFileSync(
          `${currentDir}/not-vulnerable/package.json`,
          `${tmpDir}/package.json`
        )
        fs.copyFileSync(
          `${currentDir}/not-vulnerable/package-lock.json`,
          `${tmpDir}/package-lock.json`
        )

        const sut = audit.Audit.create()
        const result = await sut.fix(tmpDir)

        const expected: audit.AuditResult = {
          stdout: expect.stringContaining('fixed 0 of 0 vulnerabilities'),
          stderr: '',
          exitCode: 0
        }
        expect(result).toEqual(expected)
      } finally {
        fs.rmdirSync(tmpDir, {recursive: true})
      }
    })

    test('when there is a vulnerability', async () => {
      const tmpDir = fs.mkdtempSync('audit')
      try {
        const currentDir = __dirname
        fs.copyFileSync(
          `${currentDir}/vulnerable/package.json`,
          `${tmpDir}/package.json`
        )
        fs.copyFileSync(
          `${currentDir}/vulnerable/package-lock.json`,
          `${tmpDir}/package-lock.json`
        )

        const sut = audit.Audit.create()
        const result = await sut.fix(tmpDir)

        const expected: audit.AuditResult = {
          stdout: expect.stringContaining('fixed 1 of 1 vulnerability'),
          stderr: '',
          exitCode: 0
        }
        expect(result).toEqual(expected)
      } finally {
        fs.rmdirSync(tmpDir, {recursive: true})
      }
    })
  })
})
