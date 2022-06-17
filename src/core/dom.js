export function hasTagName(node, tags) {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  if (typeof tags === "string") {
    return node.tagName === tags.toUpperCase();
  }

  return tags.some((tag) => node.tagName === tag.toUpperCase());
}

export function hasClass(node, className) {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  return node.classList.contains(className);
}

export function createNodeWith(tag, { innerHTML, textContent, attributes } = {}) {
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

export function replaceNodeWith(node, replacement) {
  node.replaceWith(replacement);
  return replacement;
}

export function unwrapNode(node) {
  const newNodes = node.childNodes;
  node.replaceWith(...newNodes);
  return newNodes;
}

export function textifyNode(node) {
  const newNode = document.createTextNode(node.textContent);
  node.replaceWith(newNode);
  return newNode;
}

export function removeNodes(node, callbackFn) {
  for (const el of [...node.childNodes]) {
    if (callbackFn(el)) {
      el.remove();
    }
  }
}

export function removeEmptyTextNodes(node) {
  removeNodes(node, (el) => el.nodeType === Node.TEXT_NODE && el.textContent.trim().length === 0);
}

export function removeCommentNodes(node) {
  removeNodes(node, (el) => el.nodeType === Node.COMMENT_NODE);
}

export function resetAttributesTo(node, targetAttributes) {
  for (const name of node.getAttributeNames()) {
    if (targetAttributes[name] === undefined) {
      node.removeAttribute(name);
    }
  }
  for (const name of Object.keys(targetAttributes)) {
    node.setAttribute(name, targetAttributes[name]);
  }
}

export function replaceNodeStyleByTag(node) {
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

export function trimTag(node, tag) {
  // Children
  const children = node.childNodes;

  // Remove Leading BR
  while (children.length > 0 && hasTagName(children[0], tag)) {
    children[0].remove();
  }

  // Remove Trailing BR
  while (children.length > 0 && hasTagName(children[children.length - 1], tag)) {
    children[children.length - 1].remove();
  }
}

export function cleanDomContent(root, style) {
  // Iterate through children
  for (let el of [...root.children]) {
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
      const linkAttributes = {};
      if (el.hasAttribute("href")) {
        linkAttributes.href = el.getAttribute("href");
      }
      if (el.hasAttribute("target")) {
        linkAttributes.target = el.getAttribute("target");
      }
      resetAttributesTo(el, linkAttributes);
      continue;
    }

    // Remove all tag attributes for tags in the allowed list
    if (hasTagName(el, ["b", "i", "q", "u", "s", "br"])) {
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
      if (el.textContent.trim().length === 0) {
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
