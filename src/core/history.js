function History() {
  this.buffer = [];
}

/**
 * Add a new snapshot to the history.
 * @param {string} doc the element to save
 */
History.prototype.push = function (doc) {
  this.buffer.push(doc);
  if (this.buffer.length > 20) {
    this.buffer.shift();
  }
};

/**
 * Get the last saved element
 * @returns {(string|null)} the last saved element or null
 */
History.prototype.pop = function () {
  if (this.buffer.length === 0) {
    return null;
  }
  return this.buffer.pop();
};

export { History };
