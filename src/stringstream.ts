import * as stream from 'stream'

export class StringStream extends stream.Writable {
  private contents = ''

  _write(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chunk: any,
    encoding: string,
    callback: (error?: Error | null) => void
  ): void {
    this.contents += chunk
    callback()
  }

  getContents(): string {
    return this.contents
  }
}
