export class History {
  private buffer: string[] = [];

  constructor() {}

  /**
   * Add a new snapshot to the history.
   * @param {string} doc the element to save
   */
  public push(doc: string): void {
    this.buffer.push(doc);
    if (this.buffer.length > 20) {
      this.buffer.shift();
    }
  }

  /**
   * Get the last saved element
   * @returns {(string|null)} the last saved element or null
   */
  public pop(): string | null {
    if (this.buffer.length === 0) {
      return null;
    }

    return this.buffer.pop()!;
  }
}
