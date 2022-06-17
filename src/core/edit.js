import { getSelection, moveCursorInsideNode, moveCursorAfterNode, selectNodeContents } from "./range.js";
import {
  hasTagName,
  cleanDomContent,
  createNodeWith,
  unwrapNode,
  textifyNode,
  removeEmptyTextNodes,
  removeCommentNodes,
} from "./dom.js";

function insertTagAtCaret(tag, options) {
  // Get the caret position
  const { range } = getSelection();

  // Create the tag
  const node = document.createElement(tag);

  // Add a zero-width char or the word "lien" to create a valid cursor position inside the element
  if (tag === "a") {
    node.textContent = options.textContent || "lien";
  } else {
    node.innerHTML = "&#x200b;";
  }

  // Insert the tag at the cursor position
  range.insertNode(node);

  // Move the cursor inside the created tag
  moveCursorInsideNode(node);

  // Add an extra space after the tag if it's a link
  if (tag === "a") {
    node.insertAdjacentText("afterend", " ");
  }

  // Return the inserted tag
  return node;
}

export function replaceSelectionByHtml(html) {
  // Get the caret position
  const { sel, range } = getSelection();

  // Check if the user has selected something
  if (range === undefined) return false;

  // Create the fragment to insert
  const frag = document.createDocumentFragment();

  // Create the nodes to insert
  const el = createNodeWith("div", { innerHTML: html });
  frag.append(...el.childNodes);
  const lastNode = frag.childNodes[frag.childNodes.length - 1];

  // Replace the current selection by the pasted content
  sel.deleteFromDocument();
  range.insertNode(frag);

  // Preserve the selection
  moveCursorAfterNode(lastNode);
}

export function wrapInsideTag(tag, options = {}) {
  // Get the caret position
  const { sel, range } = getSelection();

  // Check if there is a selection
  if (range && range.collapsed) {
    // Check if the parent element has the same tag name
    const parent = sel.anchorNode.parentNode;
    if (hasTagName(parent, tag)) {
      // Unwrap the parent node
      unwrapNode(parent);

      // We have replaced something
      // Normalize the Node & that's it. We don't have to return something
      range.commonAncestorContainer.normalize();
      return;
    }

    // We can insert an empty node a the caret
    return insertTagAtCaret(tag, options);
  }

  // There is a Selection
  // Try to remove similar tags inside
  let replaced = false;
  if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
    // The commonAncestorContainer is a TEXT Node
    // Check if the parent element has the same tag name
    if (hasTagName(range.commonAncestorContainer.parentNode, tag)) {
      // Unwrap the parent node
      unwrapNode(range.commonAncestorContainer.parentNode);
      replaced = true;
    }
  } else if (hasTagName(range.commonAncestorContainer, tag)) {
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
}

export function wrapInsideLink(text, href, targetBlank) {
  // Wrap the selection inside a link
  const tag = wrapInsideTag("a", { textContent: text });

  // Check if we have a tag
  if (tag === undefined) {
    return;
  }

  // Add an href Attribute
  tag.setAttribute("href", href);

  // Create a target="_blank" attribute if required
  if (targetBlank === true) {
    tag.setAttribute("target", "_blank");
  }

  // Return the tag
  return tag;
}

export function clearSelectionStyle() {
  // Get the caret position
  const { sel, range } = getSelection();

  // Check if there is something to do
  if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
    return;
  }

  // Try to replace all non-text elements by their text
  for (const el of [...range.commonAncestorContainer.children]) {
    // Check if the the Element Intersect the Selection
    if (sel.containsNode(el, true)) {
      // Replace the node by its text
      textifyNode(el);
    }
  }
}

export function cleanPastedHtml(html, style) {
  // Create a new div with the HTML content
  const result = document.createElement("div");
  result.innerHTML = html;

  // Clean the HTML content
  cleanDomContent(result, style);
  result.normalize();

  // Clean empty text nodes
  removeEmptyTextNodes(result);

  // Fix extra stuff in the HTML code :
  //  - Clean spaces
  //  - Merge siblings tags
  result.innerHTML = result.innerHTML
    .replace(/\s*&nbsp;\s*/g, " ")
    .replace(/\s+/g, " ")
    .replace(/(<\/b>[\n\r\s]*<b>|<\/i>[\n\r\s]*<i>|<\/u>[\n\r\s]*<u>|<\/s>[\n\r\s]*<s>)/g, " ");

  // Clean comment nodes
  removeCommentNodes(result);

  // Return Cleaned HTML
  return result;
}
