import { getSelection, isRangeRemovable, moveCursorInsideNode, moveCursorAfterNode, selectNodeContents } from './range';
import { isTag, unwrapNode } from './dom';

export function insertTagAtCaret (tag) {
  // Get the caret position
  const { range } = getSelection();

  // Create the tag
  const node = document.createElement(tag);

  // Add a zero-width char or the word "lien" to create a valid cursor position inside the element
  if (tag === 'a') {
    node.textContent = 'lien';
  } else {
    node.innerHTML = '&#x200b;';
  }

  // Insert the tag at the cursor position
  range.insertNode(node);

  // Move the cursor inside the created tag
  moveCursorInsideNode(node);

  // Add an extra space after the tag if it's a link
  if (tag === 'a') {
    node.insertAdjacentText('afterend', ' ');
  }

  // Return the inserted tag
  return node;
};

export function replaceSelectionByHtml (html) {
  // Get the caret position
  const { range } = getSelection();

  // Check if we can remove the selection
  if (!isRangeRemovable(range)) {
    // Don't Process the Event
    return;
  }

  // Remove the selection from the DOM
  range.deleteContents();

  // Range.createContextualFragment() would be useful here but is
  // only relatively recently standardized and is not supported in
  // some browsers (IE9, for one)
  const el = document.createElement('div');
  el.innerHTML = html;
  const frag = document.createDocumentFragment();
  let node, lastNode;
  while ((node = el.firstChild)) {
    lastNode = frag.appendChild(node);
  }
  range.insertNode(frag);

  // Preserve the selection
  if (lastNode) {
    moveCursorAfterNode(lastNode);
  }
};

export function wrapInsideTag (tag) {
  // Get the caret position
  const { sel, range } = getSelection();

  // Check if there is a selection
  if (range && range.collapsed) {
    // Check if the parent element has the same tag name
    let parent = sel.anchorNode.parentNode;
    if (isTag(parent, tag)) {
      // Take the parent
      parent = parent.parentNode;

      // The parent element has the same tag name
      // The user want's to close the tag
      // Append a zero-width char to create a valid cursor position at the end of the parent node
      parent.insertAdjacentHTML('beforeend', '&#x200b;');

      // Select the parent tag
      selectNodeContents(parent);

      // Return the parent tag
      return parent;
    }

    // We can insert an empty node a the caret
    return insertTagAtCaret(tag);
  }

  // There is a Selection
  // Try to remove similar tags inside
  let replaced = false;
  if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
    // The commonAncestorContainer is a TEXT Node
    // Check if the parent element has the same tag name
    if (isTag(range.commonAncestorContainer.parentNode, tag)) {
      // Unwrap the parent node
      unwrapNode(range.commonAncestorContainer.parentNode);
      replaced = true;
    }
  } else if (isTag(range.commonAncestorContainer, tag)) {
    // The commonAncestorContainer element has the same tag name
    // Unwrap the parent node
    unwrapNode(range.commonAncestorContainer);
    replaced = true;
  } else {
    // Try to replace all elements with the same tag name in the selection
    for (const el of [...range.commonAncestorContainer.getElementsByTagName(tag)]) {
      // Check if the the Element Intersect the Selection
      if (sel.containsNode(el, true)) {
        unwrapNode(el);
        replaced = true;
      }
    }
  }

  // Check if we have replaced something
  if (!replaced) {
    // Nothing was replaced
    // Wrap the selection inside the given tag
    const node = document.createElement(tag);
    range.surroundContents(node);

    // Select & return the created tag
    selectNodeContents(node);
    return node;
  }

  // We have replaced something
  // Normalize the Node & that's it. We don't have to return something
  range.commonAncestorContainer.normalize();
};

export function wrapInsideLink (href, targetBlank) {
  // Wrap the selection inside a link
  const tag = wrapInsideTag('a');

  // Check if we have a tag
  if (tag === undefined) {
    return;
  }

  // Add an href Attribute
  tag.setAttribute('href', href);

  // Create a target="_blank" attribute if required
  if (targetBlank === true) {
    tag.setAttribute('target', '_blank');
  }

  // Return the tag
  return tag;
};
