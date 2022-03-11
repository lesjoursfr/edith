export function isTag (node, tag) {
  return (node.nodeType === Node.ELEMENT_NODE) && (node.tagName === tag.toUpperCase());
}

export function unwrapNode (node) {
  node.replaceWith(...node.childNodes);
}
