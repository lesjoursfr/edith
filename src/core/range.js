/**
 * @typedef {Object} CurrentSelection
 * @property {Selection} sel the current selection
 * @property {(Range|undefined)} range the current range
 */

/**
 * Get the current selection.
 * @returns {CurrentSelection} the current selection
 */
export function getSelection() {
  const sel = window.getSelection();

  return { sel, range: sel.rangeCount ? sel.getRangeAt(0) : undefined };
}

/**
 * Restore the given selection.
 * @param {Selection} selection the selection to restore
 */
export function restoreSelection(selection) {
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(selection.range);
}

/**
 * Move the cursor inside the node.
 * @param {Node} target the targeted node
 */
export function moveCursorInsideNode(target) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.setStart(target, 1);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Move the cursor after the node.
 * @param {Node} target the targeted node
 */
export function moveCursorAfterNode(target) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.setStartAfter(target);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Select the node's content.
 * @param {Node} target the targeted node
 */
export function selectNodeContents(target) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(target);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}
