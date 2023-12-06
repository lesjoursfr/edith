import assert from "assert";
import { JSDOM } from "jsdom";
import { cleanDomContent } from "../src/core/edit.js";

it("core.edit.cleanDomContent", () => {
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
