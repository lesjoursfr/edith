import {
  cleanDomContent,
  createNodeWith,
  hasClass,
  hasTagName,
  isHTMLElement,
  isSelfClosing,
  removeCommentNodes,
  removeEmptyTextNodes,
  removeNodes,
  textifyNode,
  unwrapNode,
} from "./dom.js";
import { getSelection, moveCursorAfterNode, moveCursorInsideNode, selectNodeContents, selectNodes } from "./range.js";

/**
 * Split the node at the caret position.
 * @param {Range} range the caret position
 * @param {HTMLElement} node the node to split
 * @returns {Text} the created text node with the caret inside
 */
function splitNodeAtCaret(range: Range, node: HTMLElement): Text {
  // Get the node's parent
  const parent = node.parentNode as HTMLElement;

  // Clone the current range & move the starting point to the beginning of the parent's node
  const beforeCaret = range.cloneRange();
  beforeCaret.setStart(parent, 0);

  // Extract the content before the caret
  const frag = beforeCaret.extractContents();

  // Add a TextNode
  const textNode = document.createTextNode("\u200B");
  frag.append(textNode);

  // Add back the content into the node's parent
  parent.prepend(frag);

  // Move the cursor in the created TextNode
  moveCursorInsideNode(textNode);

  // Return the inserted TextNode
  return textNode;
}

/**
 * Extract the selection from the node.
 * @param {Range} range the selection to extract
 * @param {HTMLElement} node the node to split
 * @param {string} tag the tag to remove
 * @returns {HTMLElement} the created node
 */
function extractSelectionFromNode(range: Range, node: HTMLElement): HTMLElement {
  // Get the node's parent
  const parent = node.parentNode as HTMLElement;

  // Clone the current range & move the starting point to the beginning of the parent's node
  const beforeSelection = new Range();
  beforeSelection.selectNodeContents(parent);
  beforeSelection.setEnd(range.startContainer, range.startOffset);
  const afterSelection = new Range();
  afterSelection.selectNodeContents(parent);
  afterSelection.setStart(range.endContainer, range.endOffset);

  // Extract the content of the selection
  const fragBefore = beforeSelection.extractContents();
  const fragAfter = afterSelection.extractContents();

  // Add back the content into the node's parent
  parent.prepend(fragBefore);
  parent.append(fragAfter);

  // Remove the parent from the selection
  let current = range.commonAncestorContainer as HTMLElement;
  while (current.tagName !== node.tagName) {
    // Take the parent
    current = current.parentNode as HTMLElement;
  }
  const innerNodes = unwrapNode(current);

  // Preserve the selection
  selectNodes(innerNodes);

  // Return the inserted TextNode
  return range.commonAncestorContainer as HTMLElement;
}

/**
 * Create a node at the caret position.
 * @param {Range} range the caret position
 * @param {string} tag the tag name of the node
 * @param {object} options optional parameters
 * @param {string} options.textContent the text content of the node
 * @returns {HTMLElement} the created node with the caret inside
 */
function insertTagAtCaret<K extends keyof HTMLElementTagNameMap>(
  range: Range,
  tag: K,
  options: { textContent?: string } = {}
): HTMLElementTagNameMap[K] {
  // Create the tag
  const node = document.createElement(tag);

  // Add a zero-width char or the word "lien" to create a valid cursor position inside the element
  if (tag === "a") {
    node.textContent = options.textContent || "lien";
  } else {
    node.innerHTML = "\u200B";
  }

  // Insert the tag at the cursor position
  range.insertNode(node);

  // Add an extra space after the tag if it's a link
  if (tag === "a") {
    node.insertAdjacentText("afterend", " ");
  }

  // Move the cursor inside the created tag
  moveCursorInsideNode(node);

  // Return the inserted tag
  return node;
}

/**
 * Replace the current selection by the given HTML code.
 * @param {string} html the HTML code
 */
export function replaceSelectionByHtml(html: string): void {
  // Get the caret position
  const { sel, range } = getSelection();

  // Check if the user has selected something
  if (range === undefined) {
    return;
  }

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

/**
 * Wrap the current selection inside a new node.
 * @param {string} tag the tag name of the node
 * @param {object} options optional parameters
 * @param {string} options.textContent the text content of the node
 * @returns {HTMLElement|Text} the created node or the root node
 */
export function wrapInsideTag<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: { textContent?: string } = {}
): HTMLElement | Text | undefined {
  // Get the caret position
  const { sel, range } = getSelection();

  // Check if the user has selected something
  if (range === undefined) {
    return;
  }

  // Check if there is a Selection
  if (range.collapsed) {
    // Check if a parent element has the same tag name
    let parent = sel.anchorNode!.parentNode as HTMLElement;
    while (!hasClass(parent, "edith-visual")) {
      if (hasTagName(parent, tag)) {
        // One of the parent has the same tag name
        // Split the parent at the caret & insert a TextNode
        return splitNodeAtCaret(range, parent);
      }

      // Take the parent
      parent = parent.parentNode as HTMLElement;
    }

    // We just have to insert a new Node at the caret position
    return insertTagAtCaret(range, tag, options);
  }

  // There is a selection
  // Check if a parent element has the same tag name
  let parent = range.commonAncestorContainer as HTMLElement;
  while (!hasClass(parent, "edith-visual")) {
    if (hasTagName(parent, tag)) {
      // One of the parent has the same tag name
      // Extract the selection from the parent
      return extractSelectionFromNode(range, parent);
    }

    // Take the parent
    parent = parent.parentNode as HTMLElement;
  }

  // Try to replace all elements with the same tag name in the selection
  for (const el of [...parent.getElementsByTagName(tag)] as HTMLElement[]) {
    // Check if the the Element Intersect the Selection
    if (sel.containsNode(el, true)) {
      // Unwrap the node
      const innerNodes = unwrapNode(el);

      // Return the node
      selectNodes(innerNodes);
      parent.normalize();
      return parent;
    }
  }

  // Nothing was replaced
  // Wrap the selection inside the given tag
  const node = document.createElement(tag);
  node.appendChild(range.extractContents());
  range.insertNode(node);

  // Remove empty tags
  removeNodes(parent, (el) => {
    return isHTMLElement(el) && !isSelfClosing(el.tagName) && (el.textContent === null || el.textContent.length === 0);
  });

  // Return the node
  selectNodeContents(node);
  return node;
}

/**
 * Wrap the current selection inside a link.
 * @param {string} text the text of the link
 * @param {string} href the href of the link
 * @param {boolean} targetBlank add target="_blank" attribute or not
 * @returns {HTMLElement|Text} the created node
 */
export function wrapInsideLink(text: string, href: string, targetBlank: boolean): HTMLElement | Text | undefined {
  // Wrap the selection inside a link
  const tag = wrapInsideTag("a", { textContent: text });

  // Check if we have a tag
  if (tag === undefined) {
    return;
  }

  // Check if it's a Text node
  if (!isHTMLElement(tag)) {
    return tag;
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

/**
 * Clear the style in the current selection.
 */
export function clearSelectionStyle(): void {
  // Get the caret position
  const { sel, range } = getSelection();

  // Check if there is something to do
  if (range === undefined || range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
    return;
  }

  // Try to replace all non-text elements by their text
  for (const el of [...(range.commonAncestorContainer as HTMLElement).children] as HTMLElement[]) {
    // Check if the the Element Intersect the Selection
    if (sel.containsNode(el, true)) {
      // Replace the node by its text
      textifyNode(el);
    }
  }
}

/**
 * Clean the given HTML code.
 * @param {string} html the HTML code to clean
 * @param {object} style active styles
 * @returns {HTMLElement} the cleaned HTML code
 */
export function cleanPastedHtml(html: string, style: { [keyof: string]: boolean }): HTMLElement {
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
