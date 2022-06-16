import {
  getSelection,
  isRangeRemovable,
  moveCursorInsideNode,
  moveCursorAfterNode,
  selectNodeContents,
} from "./range.js";
import {
  hasTagName,
  createNodeWith,
  replaceNodeWith,
  unwrapNode,
  textifyNode,
  removeEmptyTextNodes,
  removeCommentNodes,
  resetAttributesTo,
  replaceNodeStyleByTag,
  trimTag,
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
  const el = createNodeWith("div", { innerHTML: html });
  const frag = document.createDocumentFragment();
  frag.append(...el.childNodes);
  const lastNode = frag.childNodes[frag.childNodes.length - 1];
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

export function cleanDomContent(root, style) {
  // Iterate through children
  for (let el of [...root.children]) {
    // Check if the span is an edith-nbsp
    if (hasTagName(el, "span") && el.classList.contains("edith-nbsp")) {
      // Ensure that we have a clean element
      resetAttributesTo(el, { class: "edith-nbsp", contenteditable: "false" });
      el.innerHTML = "¶";

      // Stop processing the element
      return true;
    }

    // Check if there is a style attribute on the current node
    if (el.hasAttribute("style")) {
      // Replace the style attribute by tags
      el = replaceNodeStyleByTag(el);
    }

    // Check if the Tag Match a Parent Tag
    if (style[el.tagName]) {
      el = replaceNodeWith(
        el,
        createNodeWith("span", { attributes: { style: el.getAttribute("style") || "" }, innerHTML: el.innerHTML })
      );
    }

    // Save the Current Style Tag
    const newTags = { ...style };
    if (hasTagName(el, ["b", "i", "q", "u", "s"])) {
      newTags[el.tagName] = true;
    }

    // Clean Children
    cleanDomContent(el, newTags);

    // Keep only href & target attributes for <a> tags
    if (hasTagName(el, "a")) {
      const linkAttributes = {};
      if (el.hasAttribute("href")) {
        linkAttributes.href = el.getAttribute("href");
      }
      if (el.hasAttribute("target")) {
        linkAttributes.target = el.getAttribute("target");
      }
      resetAttributesTo(el, linkAttributes);
      return;
    }

    // Remove all tag attributes for tags in the allowed list
    if (hasTagName(el, ["b", "i", "q", "u", "s", "br"])) {
      resetAttributesTo(el, {});
      return;
    }

    // Remove useless tags
    if (hasTagName(el, ["style", "meta", "link"])) {
      el.remove();
      return;
    }

    // Check if it's a <p> tag
    if (hasTagName(el, "p")) {
      // Check if the element contains text
      if (el.textContent.trim().length === 0) {
        // Remove the node
        el.remove();
        return;
      }

      // Remove all tag attributes
      resetAttributesTo(el, {});

      // Remove leading & trailing <br>
      trimTag(el, "br");

      // Return
      return;
    }

    // Unwrap the node
    unwrapNode(el);
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
