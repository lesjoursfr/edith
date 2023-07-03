import test from "ava";
import { JSDOM } from "jsdom";
import { Edith } from "../src/index.js";

test("ui.editor.setContent", (t) => {
  const dom = new JSDOM('<!DOCTYPE html><div id="editor"></div>');
  const edith = new Edith(dom.window.document.getElementById("editor"), {});
  edith.setContent("<b>Bold Text</b>");

  t.is(edith.editor.editors.visual.innerHTML, "<b>Bold Text</b>");
});

test("ui.editor.getContent", (t) => {
  const dom = new JSDOM('<!DOCTYPE html><div id="editor"></div>');
  const edith = new Edith(dom.window.document.getElementById("editor"), {});
  edith.editor.editors.visual.innerHTML =
    '<i></i><b style="color: white; background-color: black;"><i>Italic</i> and Bold Text</b>';

  t.is(edith.getContent(), "<b><i>Italic</i> and Bold Text</b>");

  edith.editor.editors.visual.innerHTML =
    '<span style="color: white; background-color: black;"><i>Italic</i> and <span><span style="color: red;">Bold</span> Text</span></span>';

  t.is(edith.getContent(), "<i>Italic</i> and Bold Text");
});

test("ui.editor.destroy", (t) => {
  const dom = new JSDOM('<!DOCTYPE html><div id="editor"></div>');
  const edith = new Edith(dom.window.document.getElementById("editor"), {});
  const editor = dom.window.document.getElementById("editor");
  edith.destroy();

  t.false(editor.classList.contains("edith"));
  t.is(editor.querySelector(".edith-toolbar"), null);
  t.is(editor.querySelector(".edith-editing-area"), null);
  t.is(editor.querySelector(".edith-visual"), null);
  t.is(editor.querySelector(".edith-code"), null);
  t.is(editor.querySelector(".edith-modals"), null);
});
