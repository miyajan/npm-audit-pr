import * as strings from '../src/strings'

describe('strings.base64Encode', () => {
  test('encode string to base64 string', () => {
    const expected = 'aG9nZQ=='
    expect(strings.base64Encode('hoge')).toBe(expected)
  })
})
