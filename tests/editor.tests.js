import test from "ava";
import { Edith } from "../src/index.js";

/* Initialize a WYSIWYG Editor for testing */
const element = document.createElement("div");
element.setAttribute("id", "editor");
const edith = new Edith(element, {});

test("core.editor.setContent", (t) => {
  edith.setContent("<b>Bold Text</b>");

  t.is(edith.editor.editors.visual.innerHTML, "<b>Bold Text</b>");
});

test("core.editor.getContent", (t) => {
  edith.editor.editors.visual.innerHTML = "<i></i><b><i>Italic</i> and Bold Text</b>";

  t.is(edith.getContent(), "<b><i>Italic</i> and Bold Text</b>");
});

test("core.editor.destroy", (t) => {
  edith.destroy();

  t.is(edith.element, undefined);
  t.is(edith.toolbar, undefined);
  t.is(edith.editor, undefined);
  t.is(edith.modals, undefined);
});
