import * as github from '../src/github'
import * as actionsGitHub from '@actions/github'

describe('GitHub', () => {
  describe('getDefaultBranch', () => {
    test('returns default branch of repository', async () => {
      const octokit = new actionsGitHub.GitHub('dummy')
      const spy = jest.spyOn(octokit.repos, 'get') as jest.Mock
      spy.mockResolvedValueOnce({
        status: 200,
        data: {
          // eslint-disable-next-line @typescript-eslint/camelcase
          default_branch: 'master'
        }
      })

      const sut = new github.GitHub(octokit)
      const defaultBranch = await sut.getDefaultBranch(
        'miyajan',
        'npm-audit-pr'
      )
      const expected = 'master'
      expect(defaultBranch).toBe(expected)
    })

    test('throws error when api returns error', async () => {
      const octokit = new actionsGitHub.GitHub('dummy')
      const spy = jest.spyOn(octokit.repos, 'get') as jest.Mock
      spy.mockRejectedValueOnce(new Error('Not Found'))

      const sut = new github.GitHub(octokit)
      await expect(
        sut.getDefaultBranch('invalid-owner', 'invalid-repo')
      ).rejects.toThrow('Not Found')
    })
  })
})
