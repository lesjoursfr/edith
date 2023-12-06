import { isHTMLElement, isSelfClosing } from "@lesjoursfr/browser-tools";

/**
 * @typedef {Object} CurrentSelection
 * @property {Selection} sel the current selection
 * @property {(Range|undefined)} range the current range
 */
export type CurrentSelection = {
  sel: Selection;
  range?: Range;
};

/**
 * Get the current selection.
 * @returns {CurrentSelection} the current selection
 */
export function getSelection(): CurrentSelection {
  const sel = window.getSelection()!;

  return { sel, range: sel.rangeCount ? sel.getRangeAt(0) : undefined };
}

/**
 * Restore the given selection.
 * @param {CurrentSelection} selection the selection to restore
 */
export function restoreSelection(selection: CurrentSelection): void {
  const sel = window.getSelection()!;
  sel.removeAllRanges();
  if (selection.range !== undefined) {
    sel.addRange(selection.range);
  }
}

/**
 * Move the cursor inside the node.
 * @param {ChildNode} target the targeted node
 */
export function moveCursorInsideNode(target: ChildNode): void {
  const range = document.createRange();
  const sel = window.getSelection()!;
  range.setStart(target, 1);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Move the cursor after the node.
 * @param {ChildNode} target the targeted node
 */
export function moveCursorAfterNode(target: ChildNode): void {
  const range = document.createRange();
  const sel = window.getSelection()!;
  range.setStartAfter(target);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Select the node's content.
 * @param {ChildNode} target the targeted node
 */
export function selectNodeContents(target: ChildNode): void {
  const range = document.createRange();
  const sel = window.getSelection()!;
  range.selectNodeContents(target);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Select the given Nodes.
 * @param {Array<ChildNode>} nodes The list of Nodes to select.
 */
export function selectNodes(nodes: ChildNode[]): void {
  // Check if we just have a self-closing tag
  if (nodes.length === 1 && isHTMLElement(nodes[0]) && isSelfClosing(nodes[0].tagName)) {
    moveCursorAfterNode(nodes[0]); // Move the cursor after the Node
    return;
  }
  // Select Nodes
  const range = document.createRange();
  const sel = window.getSelection()!;
  range.setStartBefore(nodes[0]);
  range.setEndAfter(nodes[nodes.length - 1]);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Check if the current selection is inside the given node.
 * @param {ChildNode} node the targeted node
 * @returns {boolean} true if the selection is inside
 */
export function isSelectionInsideNode(node: ChildNode): boolean {
  const { range } = getSelection();
  if (range === undefined) {
    return false;
  }

  return node.contains(range.startContainer) && node.contains(range.endContainer);
}
