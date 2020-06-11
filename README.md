# npm-audit-pr

A GitHub action to create a pull request for npm audit fix.

## Inputs

### `token`

**Required** The GitHub Token to create a pull request.

### `npm-directory`

The directory for npm audit fix. (Default: workspace)

### `base-branch`

The base branch name of pull request. (Default: default branch)

### `head-branch`

The head branch name of pull request. (Default: npm-audit-fix)

## Outputs

### `pr-number`

The pull request number.

## Example Usage

```yaml
on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  npm-audit-pr:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2.0.0
      - uses: miyajan/npm-audit-pr@v1.0.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```
