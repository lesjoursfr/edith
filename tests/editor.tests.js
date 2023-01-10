import test from "ava";
import { Edith } from "../src/index.js";

/* Initialize a WYSIWYG Editor for testing */
const element = document.createElement("div");
element.setAttribute("id", "editor");
const edith = new Edith(element, {});

test("editor.dom.setContent", (t) => {
  edith.setContent("<b>Bold Text</b>");

  t.is(edith.editor.editors.visual.innerHTML, "<b>Bold Text</b>");
});

test("editor.dom.getContent", (t) => {
  edith.editor.editors.visual.innerHTML = "<i></i><b><i>Italic</i> and Bold Text</b>";

  t.is(edith.getContent(), "<b><i>Italic</i> and Bold Text</b>");
});
