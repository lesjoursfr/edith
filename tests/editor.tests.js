import assert from "assert";
import { JSDOM } from "jsdom";
import { Edith } from "../src/index.js";

it("ui.editor.setContent", () => {
  const dom = new JSDOM('<!DOCTYPE html><div id="editor"></div>');
  const edith = new Edith(dom.window.document.getElementById("editor"), {});
  edith.setContent("<b>Bold Text</b>");

  assert.strictEqual(edith.editor.editors.visual.innerHTML, "<b>Bold Text</b>");
});

it("ui.editor.getContent", () => {
  const dom = new JSDOM('<!DOCTYPE html><div id="editor"></div>');
  const edith = new Edith(dom.window.document.getElementById("editor"), {});
  edith.editor.editors.visual.innerHTML =
    '<i></i><b style="color: white; background-color: black;"><i>Italic</i> and Bold Text</b>';

  assert.strictEqual(edith.getContent(), "<b><i>Italic</i> and Bold Text</b>");

  edith.editor.editors.visual.innerHTML =
    '<span style="color: white; background-color: black;"><i>Italic</i> and <span><span style="color: red;">Bold</span> Text</span></span>';

  assert.strictEqual(edith.getContent(), "<i>Italic</i> and Bold Text");
});

it("ui.editor.destroy", () => {
  const dom = new JSDOM('<!DOCTYPE html><div id="editor"></div>');
  const edith = new Edith(dom.window.document.getElementById("editor"), {});
  const editor = dom.window.document.getElementById("editor");
  edith.destroy();

  assert.strictEqual(editor.classList.contains("edith"), false);
  assert.strictEqual(editor.querySelector(".edith-toolbar"), null);
  assert.strictEqual(editor.querySelector(".edith-editing-area"), null);
  assert.strictEqual(editor.querySelector(".edith-visual"), null);
  assert.strictEqual(editor.querySelector(".edith-code"), null);
  assert.strictEqual(editor.querySelector(".edith-modals"), null);
});
