import test from "ava";
import { Edith } from "../src/index.js";

/* Initialize a WYSIWYG Editor for testing */
const element = document.createElement("div");
element.setAttribute("id", "editor");
const edith = new Edith(element, {
  height: 200,
  resizable: true,
  toolbar: [
    ["style", ["bold", "italic", "underline", "strikethrough", "subscript", "superscript", "nbsp", "clear"]],
    ["insert", ["link"]],
    ["misc", ["codeview"]],
  ],
});

test("editor.dom.setContent", (t) => {
  edith.setContent("<b>Bold Text</b>");

  t.not(edith.getContent(), "");
});

test("editor.dom.getContent", (t) => {
  edith.setContent("<i></i><b><i>Italic</i> and Bold Text</b>");

  t.is(edith.getContent(), "<b><i>Italic</i> and Bold Text</b>");
});
