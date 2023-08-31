import assert from "assert";
import { JSDOM } from "jsdom";
import {
  hasClass,
  hasTagName,
  cleanDomContent,
  createNodeWith,
  replaceNodeWith,
  unwrapNode,
  textifyNode,
  removeNodes,
  removeNodesRecursively,
  removeEmptyTextNodes,
  removeCommentNodes,
  resetAttributesTo,
  replaceNodeStyleByTag,
  trimTag,
} from "../src/core/dom.js";

it("core.dom.hasTagName", () => {
  const dom = new JSDOM("<!DOCTYPE html><p>Hello world</p>");

  assert.strictEqual(hasTagName(dom.window.document.querySelector("p"), "i"), false);
  assert.strictEqual(hasTagName(dom.window.document.querySelector("p"), ["i", "u"]), false);
  assert.strictEqual(hasTagName(dom.window.document.querySelector("p"), "p"), true);
  assert.strictEqual(hasTagName(dom.window.document.querySelector("p"), ["i", "u", "p"]), true);
});

it("core.dom.hasClass", () => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar">Hello world</p>');

  assert.strictEqual(hasClass(dom.window.document.querySelector("p"), "foo"), false);
  assert.strictEqual(hasClass(dom.window.document.querySelector("p"), "bar"), true);
});

it("core.dom.createNodeWith", () => {
  const node1 = createNodeWith("span", {
    innerHTML: "<b>Bold text</b>",
    attributes: { attr1: "value1", attr2: "value2" },
  });
  assert.strictEqual(node1.outerHTML, '<span attr1="value1" attr2="value2"><b>Bold text</b></span>');

  const node2 = createNodeWith("span", {
    textContent: "Simple text",
    attributes: { attr1: "value1", attr2: "value2" },
  });
  assert.strictEqual(node2.outerHTML, '<span attr1="value1" attr2="value2">Simple text</span>');
});

it("core.dom.replaceNodeWith", () => {
  const dom = new JSDOM("<!DOCTYPE html><p>Hello world</p>");
  const node = document.createElement("span");
  node.textContent = "Simple text";

  replaceNodeWith(dom.window.document.querySelector("p"), node);
  assert.strictEqual(dom.window.document.body.innerHTML, "<span>Simple text</span>");
});

it("core.dom.unwrapNode", () => {
  const dom = new JSDOM("<!DOCTYPE html><div><b>Hello world</b>, this is a simple text</div>");

  unwrapNode(dom.window.document.querySelector("div"));
  assert.strictEqual(dom.window.document.body.innerHTML, "<b>Hello world</b>, this is a simple text");
});

it("core.dom.textifyNode", () => {
  const dom = new JSDOM("<!DOCTYPE html><div><b>Hello world</b>, this is a simple text</div>");

  textifyNode(dom.window.document.querySelector("div"));
  assert.strictEqual(dom.window.document.body.innerHTML, "Hello world, this is a simple text");
});

it("core.dom.removeNodes", () => {
  const dom = new JSDOM("<!DOCTYPE html><div></div><p>Hello world</p><span></span>");

  removeNodes(dom.window.document.body, (el) => el.nodeType === Node.ELEMENT_NODE && el.tagName !== "P");
  assert.strictEqual(dom.window.document.body.innerHTML, "<p>Hello world</p>");
});

it("core.dom.removeNodesRecursively", () => {
  const dom = new JSDOM(
    "<!DOCTYPE html><div><span></span></div><p>This is a simple text with <i>italic text<span></span></i> and empty tags<b></b></p><span></span>"
  );

  removeNodesRecursively(
    dom.window.document.body,
    (el) => el.nodeType === Node.ELEMENT_NODE && el.textContent.length === 0
  );
  assert.strictEqual(
    dom.window.document.body.innerHTML,
    "<p>This is a simple text with <i>italic text</i> and empty tags</p>"
  );
});

it("core.dom.removeEmptyTextNodes", () => {
  const dom = new JSDOM("<!DOCTYPE html><p>Hello world <b> </b></p> <!-- Comments --> <div> </div>");

  removeEmptyTextNodes(dom.window.document.body);
  assert.strictEqual(dom.window.document.body.innerHTML, "<p>Hello world <b> </b></p><!-- Comments --><div> </div>");
});

it("core.dom.removeCommentNodes", () => {
  const dom = new JSDOM("<!DOCTYPE html><p>Hello world <b> </b></p> <!-- Comments --> <div> </div>");

  removeCommentNodes(dom.window.document.body);
  assert.strictEqual(dom.window.document.body.innerHTML, "<p>Hello world <b> </b></p>  <div> </div>");
});

it("core.dom.resetAttributesTo", () => {
  const node = document.createElement("span");
  node.setAttribute("attr1", "value1");
  node.setAttribute("attr2", "value2");
  node.setAttribute("attr3", "value3");
  node.textContent = "Simple text";

  resetAttributesTo(node, { foo: "bar" });
  assert.strictEqual(node.outerHTML, '<span foo="bar">Simple text</span>');

  resetAttributesTo(node, {});
  assert.strictEqual(node.outerHTML, "<span>Simple text</span>");
});

it("core.dom.replaceNodeStyleByTag", () => {
  let node = document.createElement("b");
  node.setAttribute("style", "font-weight: normal;");
  node.textContent = "Simple text";

  node = replaceNodeStyleByTag(node);
  assert.strictEqual(node.outerHTML, '<span style="font-weight: normal;">Simple text</span>');

  node = document.createElement("span");
  node.setAttribute("style", "font-weight: 900;");
  node.textContent = "Simple text";

  node = replaceNodeStyleByTag(node);
  assert.strictEqual(node.outerHTML, '<b><span style="">Simple text</span></b>');

  node = document.createElement("span");
  node.setAttribute("style", "font-style: italic;");
  node.textContent = "Simple text";

  node = replaceNodeStyleByTag(node);
  assert.strictEqual(node.outerHTML, '<i><span style="">Simple text</span></i>');
});

it("core.dom.trimTag", () => {
  const dom = new JSDOM(
    "<!DOCTYPE html><div></div><div></div><p>Hello world</p><div></div><span>Simple text</span><div></div>"
  );

  trimTag(dom.window.document.body, "div");
  assert.strictEqual(dom.window.document.body.innerHTML, "<p>Hello world</p><div></div><span>Simple text</span>");
});

it("core.dom.cleanDomContent", () => {
  let dom = new JSDOM(
    '<!DOCTYPE html><div><span style="color: rgb(33, 37, 41); font-weight: bold; font-style: normal;">Bold text</span>,<span style="color: rgb(33, 37, 41); font-style: normal; font-weight: 400;"> simple span</span> & <span style="color: rgb(33, 37, 41); font-weight: normal; font-style: italic; ">Italic text</span></div>'
  );

  cleanDomContent(dom.window.document.body, { B: true, I: false, U: false, S: false, Q: false });
  assert.strictEqual(dom.window.document.body.innerHTML, "Bold text, simple span &amp; <i>Italic text</i>");

  dom = new JSDOM(
    '<!DOCTYPE html><div><span style="font-family: var(--bs-body-font-family); font-size: var(--bs-body-font-size); font-weight: var(--bs-body-font-weight); text-align: var(--bs-body-text-align);">Text simple <sup>exposant</sup><span class="edith-nbsp" contenteditable="false">¶</span>suite du texte simple.</span></div>'
  );

  cleanDomContent(dom.window.document.body, { B: false, I: false, U: false, S: false, Q: false });
  assert.strictEqual(
    dom.window.document.body.innerHTML,
    'Text simple <sup>exposant</sup><span class="edith-nbsp" contenteditable="false">¶</span>suite du texte simple.'
  );
});
