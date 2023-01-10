import test from "ava";
import { Edith } from "../src/index.js";
import { createNodeWith } from "../src/core/dom.js";

/* Initialize a WYSIWYG Editor for testing */
const element = createNodeWith("div", { attributes: { id: "editor" } });
const edith = new Edith(element, {
  height: 200,
  resizable: true,
  toolbar: [
    ["style", ["bold", "italic", "underline", "strikethrough", "subscript", "superscript", "nbsp", "clear"]],
    ["insert", ["link"]],
    ["misc", ["codeview"]],
  ],
});
const editor = edith.editor;

test("editor.dom.setContent", (t) => {
  edith.setContent("<b>Bold Text</b>");

  t.is(editor.editors.visual.innerHTML, "<b>Bold Text</b>");
});

test("editor.dom.getContent", (t) => {
  editor.editors.visual.innerHTML = "<i></i><b><i>Italic</i> and Bold Text</b>";

  t.is(edith.getContent(), "<b><i>Italic</i> and Bold Text</b>");
});
