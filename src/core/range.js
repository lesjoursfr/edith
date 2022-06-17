export function getSelection() {
  const sel = window.getSelection();

  return { sel, range: sel.rangeCount ? sel.getRangeAt(0) : undefined };
}

export function restoreSelection(selection) {
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(selection.range);
}

export function isRangeRemovable(range) {
  return range.collapsed !== false || range.startContainer.parentNode === range.endContainer.parentNode;
}

export function moveCursorInsideNode(target) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.setStart(target, 1);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

export function moveCursorAfterNode(target) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.setStartAfter(target);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

export function selectNodeContents(target) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(target);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}
