const dataNamespace = "edithData";

type EdithData = {
  [key: string]: string | null;
};

declare global {
  interface Document {
    edithData: EdithData;
  }
  interface HTMLElement {
    edithData: EdithData;
  }
}

/**
 * Convert a dashed string to camelCase
 */
function dashedToCamel(string: string): string {
  return string.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
}

/**
 * Check if an node is a tag element
 */
function isTagElement(node: ChildNode, tag: string): node is HTMLElement {
  return isHTMLElement(node) && node.tagName === tag.toUpperCase();
}

/**
 * Check if a node is an HTML Element.
 * @param {Node} node the node to test
 * @returns {boolean} true if the node is an HTMLElement
 */
export function isCommentNode(node: Node): node is Comment {
  return node.nodeType === Node.COMMENT_NODE;
}

/**
 * Check if a node is an HTML Element.
 * @param {Node} node the node to test
 * @returns {boolean} true if the node is an HTMLElement
 */
export function isTextNode(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE;
}

/**
 * Check if a node is an HTML Element.
 * @param {Node} node the node to test
 * @returns {boolean} true if the node is an HTMLElement
 */
export function isHTMLElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE;
}

/**
 * Create an HTMLElement from the HTML template.
 * @param {string} template the HTML template
 * @returns {HTMLElement} the created HTMLElement
 */
export function createFromTemplate(template: string): HTMLElement {
  const range = document.createRange();
  range.selectNode(document.body);
  return range.createContextualFragment(template).children[0] as HTMLElement;
}

/**
 * Update the given CSS property.
 * If the value is `null` the property will be removed.
 * @param {HTMLElement} node the node to update
 * @param {string|{ [key: string]: string|null }} property multi-word property names are hyphenated (kebab-case) and not camel-cased.
 * @param {string|null} value (default to `null`)
 * @returns {HTMLElement} the element
 */

export function updateCSS(
  node: HTMLElement,
  property: string | { [key: string]: string | null },
  value: string | null = null
): HTMLElement {
  if (typeof property !== "string") {
    for (const [key, val] of Object.entries(property)) {
      val !== null ? node.style.setProperty(key, val) : node.style.removeProperty(key);
    }
  } else {
    value !== null ? node.style.setProperty(property, value) : node.style.removeProperty(property);
  }

  return node;
}

/**
 * Check if the node has the given attribute.
 * @param {HTMLElement} node
 * @param {string} attribute
 * @returns {boolean} true or false
 */
export function hasAttribute(node: HTMLElement, attribute: string): boolean {
  return node.hasAttribute(attribute);
}

/**
 * Get the given attribute.
 * @param {HTMLElement} node
 * @param {string} attribute
 * @returns {string|null} the value
 */
export function getAttribute(node: HTMLElement, attribute: string): string | null {
  return node.getAttribute(attribute);
}

/**
 * Set the given attribute.
 * If the value is `null` the attribute will be removed.
 * @param {HTMLElement} node
 * @param {string} attribute
 * @param {string|null} value
 * @returns {HTMLElement} the element
 */
export function setAttribute(node: HTMLElement, attribute: string, value: string | null): HTMLElement {
  if (value === null) {
    node.removeAttribute(attribute);
  } else {
    node.setAttribute(attribute, value);
  }

  return node;
}

/**
 * Get the given data.
 * This function does not change the DOM.
 * If there is no key this function return all data
 * @param {HTMLElement} node
 * @param {string|undefined} key
 * @returns {EdithData|string|null} the value
 */
export function getData(node: HTMLElement, key?: string): EdithData | string | null {
  if (node[dataNamespace] === undefined) {
    node[dataNamespace] = {};
    for (const [k, v] of Object.entries(node.dataset)) {
      if (v === undefined) {
        continue;
      }
      node[dataNamespace][dashedToCamel(k)] = v;
    }
  }

  return key === undefined ? node[dataNamespace] : node[dataNamespace][dashedToCamel(key)] ?? null;
}

/**
 * Set the given data.
 * If the value is `null` the data will be removed.
 * This function does not change the DOM.
 * @param {HTMLElement} node
 * @param {string} key
 * @param {string|null} value
 * @returns {HTMLElement} the element
 */
export function setData(node: HTMLElement, key: string, value: string | null): HTMLElement {
  if (node[dataNamespace] === undefined) {
    node[dataNamespace] = {};
  }

  if (value === null) {
    delete node[dataNamespace][dashedToCamel(key)];
  } else {
    node[dataNamespace][dashedToCamel(key)] = value;
  }

  return node;
}

/**
 * Check if the node has the given tag name, or if its tag name is in the given list.
 * @param {HTMLElement} node the element to check
 * @param {string|Array<string>} tags a tag name or a list of tag name
 * @returns {boolean} true if the node has the given tag name
 */
export function hasTagName(node: HTMLElement, tags: string | Array<string>): boolean {
  if (typeof tags === "string") {
    return node.tagName === tags.toUpperCase();
  }

  return tags.some((tag) => node.tagName === tag.toUpperCase());
}

/**
 * Check if the node has the given class name.
 * @param {HTMLElement} node the element to check
 * @param {string} className a class name
 * @returns {boolean} true if the node has the given class name
 */
export function hasClass(node: HTMLElement, className: string): boolean {
  return node.classList.contains(className);
}

/**
 * Add the class to the node's class attribute.
 * @param {HTMLElement} node
 * @param {string|Array<string>} className
 * @returns {HTMLElement} the element
 */
export function addClass(node: HTMLElement, className: string | Array<string>): HTMLElement {
  if (typeof className === "string") {
    node.classList.add(className);
  } else {
    node.classList.add(...className);
  }

  return node;
}

/**
 * Remove the class from the node's class attribute.
 * @param {HTMLElement} node
 * @param {string|Array<string>} className
 * @returns {HTMLElement} the element
 */
export function removeClass(node: HTMLElement, className: string | Array<string>): HTMLElement {
  if (typeof className === "string") {
    node.classList.remove(className);
  } else {
    node.classList.remove(...className);
  }

  return node;
}

/**
 * Test if the node match the given selector.
 * @param {HTMLElement} node
 * @param {string} selector
 * @returns {boolean} true or false
 */
export function is(node: HTMLElement, selector: string): boolean {
  return node.matches(selector);
}

/**
 * Get the node's offset.
 * @param {HTMLElement} node
 * @returns {{ top: number, left: number }} The node's offset
 */
export function offset(node: HTMLElement): { top: number; left: number } {
  const rect = node.getBoundingClientRect();
  const win = node.ownerDocument.defaultView!;

  return {
    top: rect.top + win.scrollY,
    left: rect.left + win.scrollX,
  };
}

/**
 * Create a new node.
 * @param {string} tag the tag name of the node
 * @param {object} options optional parameters
 * @param {string} options.innerHTML the HTML code of the node
 * @param {string} options.textContent the text content of the node
 * @param {object} options.attributes attributes of the node
 * @returns {HTMLElement} the created node
 */
export function createNodeWith<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  {
    innerHTML,
    textContent,
    attributes,
  }: { innerHTML?: string; textContent?: string; attributes?: { [keyof: string]: string } } = {}
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  if (attributes) {
    for (const key in attributes) {
      if (Object.hasOwnProperty.call(attributes, key)) {
        node.setAttribute(key, attributes[key]);
      }
    }
  }

  if (typeof innerHTML === "string") {
    node.innerHTML = innerHTML;
  } else if (typeof textContent === "string") {
    node.textContent = textContent;
  }

  return node;
}

/**
 * Replace a node.
 * @param {HTMLElement} node the node to replace
 * @param {HTMLElement} replacement the new node
 * @returns {HTMLElement} the new node
 */
export function replaceNodeWith(node: HTMLElement, replacement: HTMLElement): HTMLElement {
  node.replaceWith(replacement);
  return replacement;
}

/**
 * Replace the node by its child nodes.
 * @param {HTMLElement} node the node to replace
 * @returns {Array<ChildNode>} its child nodes
 */
export function unwrapNode(node: HTMLElement): ChildNode[] {
  const newNodes = [...node.childNodes];
  node.replaceWith(...newNodes);
  return newNodes;
}

/**
 * Replace the node by its text content.
 * @param {HTMLElement} node the node to replace
 * @returns {Text} the created Text node
 */
export function textifyNode(node: HTMLElement): Text {
  const newNode = document.createTextNode(node.textContent ?? "");
  node.replaceWith(newNode);
  return newNode;
}

/**
 * Know if a tag si a self-closing tag
 * @param {string} tagName
 * @returns {boolean}
 */
export function isSelfClosing(tagName: string): boolean {
  return [
    "AREA",
    "BASE",
    "BR",
    "COL",
    "EMBED",
    "HR",
    "IMG",
    "INPUT",
    "KEYGEN",
    "LINK",
    "META",
    "PARAM",
    "SOURCE",
    "TRACK",
    "WBR",
  ].includes(tagName);
}

/**
 * Remove all node's child nodes that pass the test implemented by the provided function.
 * @param {ChildNode} node the node to process
 * @param {Function} callbackFn the predicate
 */
export function removeNodes(node: ChildNode, callbackFn: (node: ChildNode) => boolean): void {
  for (const el of [...node.childNodes]) {
    if (callbackFn(el)) {
      el.remove();
    }
  }
}

/**
 * Remove recursively all node's child nodes that pass the test implemented by the provided function.
 * @param {ChildNode} node the node to process
 * @param {Function} callbackFn the predicate
 */
export function removeNodesRecursively(node: ChildNode, callbackFn: (node: ChildNode) => boolean): void {
  // Remove the node if it meets the condition
  if (callbackFn(node)) {
    node.remove();
    return;
  }

  // Loop through the node’s children
  for (const el of [...node.childNodes]) {
    // Execute the same function if it’s an element node
    removeNodesRecursively(el, callbackFn);
  }
}

/**
 * Remove all node's child nodes that are empty text nodes.
 * @param {ChildNode} node the node to process
 */
export function removeEmptyTextNodes(node: ChildNode): void {
  removeNodes(node, (el) => isTextNode(el) && (el.textContent === null || el.textContent.trim().length === 0));
}

/**
 * Remove all node's child nodes that are comment nodes.
 * @param {ChildNode} node the node to process
 */
export function removeCommentNodes(node: ChildNode): void {
  removeNodes(node, (el) => isCommentNode(el));
}

/**
 * Reset all node's attributes to the given list.
 * @param {HTMLElement} node the node
 * @param {object} targetAttributes the requested node's attributes
 */
export function resetAttributesTo(node: HTMLElement, targetAttributes: { [keyof: string]: string }): void {
  for (const name of node.getAttributeNames()) {
    if (targetAttributes[name] === undefined) {
      node.removeAttribute(name);
    }
  }
  for (const name of Object.keys(targetAttributes)) {
    node.setAttribute(name, targetAttributes[name]);
  }
}

/**
 * Replace the node's style attribute by some regular nodes (<b>, <i>, <u> or <s>).
 * @param {HTMLElement} node the node to process
 * @returns {HTMLElement} the new node
 */
export function replaceNodeStyleByTag(node: HTMLElement): HTMLElement {
  // Get the style
  const styleAttr = node.getAttribute("style") || "";

  // Check if a tag is override by the style attribute
  if (
    (hasTagName(node, "b") && styleAttr.match(/font-weight\s*:\s*(normal|400);/)) ||
    (hasTagName(node, "i") && styleAttr.match(/font-style\s*:\s*normal;/)) ||
    (hasTagName(node, ["u", "s"]) && styleAttr.match(/text-decoration\s*:\s*none;/))
  ) {
    node = replaceNodeWith(
      node,
      createNodeWith("span", { attributes: { style: styleAttr }, innerHTML: node.innerHTML })
    );
  }

  // Infer the tag from the style
  if (styleAttr.match(/font-weight\s*:\s*(bold|700|800|900);/)) {
    node = replaceNodeWith(
      node,
      createNodeWith("b", {
        innerHTML: `<span style="${styleAttr.replace(/font-weight\s*:\s*(bold|700|800|900);/, "")}">${
          node.innerHTML
        }</span>`,
      })
    );
  } else if (styleAttr.match(/font-style\s*:\s*italic;/)) {
    node = replaceNodeWith(
      node,
      createNodeWith("i", {
        innerHTML: `<span style="${styleAttr.replace(/font-style\s*:\s*italic;/, "")}">${node.innerHTML}</span>`,
      })
    );
  } else if (styleAttr.match(/text-decoration\s*:\s*underline;/)) {
    node = replaceNodeWith(
      node,
      createNodeWith("u", {
        innerHTML: `<span style="${styleAttr.replace(/text-decoration\s*:\s*underline;/, "")}">${
          node.innerHTML
        }</span>`,
      })
    );
  } else if (styleAttr.match(/text-decoration\s*:\s*line-through;/)) {
    node = replaceNodeWith(
      node,
      createNodeWith("s", {
        innerHTML: `<span style="${styleAttr.replace(/text-decoration\s*:\s*line-through;/, "")}">${
          node.innerHTML
        }</span>`,
      })
    );
  }

  // Return the node
  return node;
}

/**
 * Remove all leading & trailing node's child nodes that match the given tag.
 * @param {HTMLElement} node the node to process
 * @param {string} tag the tag
 */
export function trimTag(node: HTMLElement, tag: string): void {
  // Children
  const children = node.childNodes;

  // Remove Leading
  while (children.length > 0 && isTagElement(children[0], tag)) {
    children[0].remove();
  }

  // Remove Trailing
  while (children.length > 0 && isTagElement(children[children.length - 1], tag)) {
    children[children.length - 1].remove();
  }
}

/**
 * Clean the DOM content of the node
 * @param {HTMLElement} root the node to process
 * @param {object} style active styles for the root
 */
export function cleanDomContent(root: HTMLElement, style: { [keyof: string]: boolean }): void {
  // Iterate through children
  for (let el of [...root.children] as HTMLElement[]) {
    // Check if the span is an edith-nbsp
    if (hasTagName(el, "span") && hasClass(el, "edith-nbsp")) {
      // Ensure that we have a clean element
      resetAttributesTo(el, { class: "edith-nbsp", contenteditable: "false" });
      el.innerHTML = "¶";

      continue;
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
      const linkAttributes: { href?: string; target?: string } = {};
      if (el.hasAttribute("href")) {
        linkAttributes.href = el.getAttribute("href")!;
      }
      if (el.hasAttribute("target")) {
        linkAttributes.target = el.getAttribute("target")!;
      }
      resetAttributesTo(el, linkAttributes);
      continue;
    }

    // Remove all tag attributes for tags in the allowed list
    if (hasTagName(el, ["b", "i", "q", "u", "s", "br", "sup"])) {
      resetAttributesTo(el, {});
      continue;
    }

    // Remove useless tags
    if (hasTagName(el, ["style", "meta", "link"])) {
      el.remove();
      continue;
    }

    // Check if it's a <p> tag
    if (hasTagName(el, "p")) {
      // Check if the element contains text
      if (el.textContent === null || el.textContent.trim().length === 0) {
        // Remove the node
        el.remove();
        continue;
      }

      // Remove all tag attributes
      resetAttributesTo(el, {});

      // Remove leading & trailing <br>
      trimTag(el, "br");

      // Return
      continue;
    }

    // Unwrap the node
    unwrapNode(el);
  }
}
