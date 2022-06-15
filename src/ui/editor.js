import CodeMirror from "codemirror";
import {
  wrapInsideTag,
  replaceSelectionByHtml,
  wrapInsideLink,
  clearSelectionStyle,
  cleanPastedHtml,
} from "../core/edit.js";
import { hasTagName } from "../core/dom.js";
import { EditorModes } from "../core/mode.js";
import { Events } from "../core/event.js";
import { getSelection, restoreSelection } from "../core/range.js";
import { WYSIWYGEditorModal, createInputModalField, createCheckboxModalField } from "./modal.js";

const CodeMirrorDefaults = Object.freeze({
  lineWrapping: true,
  lineNumbers: true,
  mode: "text/html",
  inputStyle: "contenteditable",
  readOnly: false,
});

function WYSIWYGEditorEditor(ctx, options) {
  this.ctx = ctx;
  this.content = options.initialContent || "";
  this.height = options.height || 80;
  this.codeMirrorOptions = Object.assign({}, CodeMirrorDefaults, options.codeMirrorOptions);
  this.mode = EditorModes.Visual;
  this.editors = {};
  this.codeMirror = null;
}

WYSIWYGEditorEditor.prototype.render = function () {
  // Create a wrapper for the editor
  const editorWrapper = document.createElement("div");
  editorWrapper.setAttribute("class", "wysiwyg-editor-editing-area");
  editorWrapper.setAttribute("style", `height: ${this.height}px`);

  // Create the visual editor
  this.editors.visual = document.createElement("div");
  this.editors.visual.setAttribute("class", "wysiwyg-editor-visual");
  this.editors.visual.setAttribute("contenteditable", "true");
  this.editors.visual.innerHTML = this.content;
  editorWrapper.append(this.editors.visual);

  // Create the code editor
  this.editors.code = document.createElement("div");
  this.editors.code.setAttribute("class", "wysiwyg-editor-code wysiwyg-editor-hidden");
  editorWrapper.append(this.editors.code);

  // Bind events
  const keyEventsListener = this.onKeyEvent.bind(this);
  this.editors.visual.addEventListener("keydown", keyEventsListener);
  this.editors.visual.addEventListener("keyup", keyEventsListener);
  const pasteEventListener = this.onPasteEvent.bind(this);
  this.editors.visual.addEventListener("paste", pasteEventListener);

  // Return the wrapper
  return editorWrapper;
};

WYSIWYGEditorEditor.prototype.wrapInsideTag = function (tag) {
  wrapInsideTag(tag);
};

WYSIWYGEditorEditor.prototype.replaceByHtml = function (html) {
  replaceSelectionByHtml(html);
};

WYSIWYGEditorEditor.prototype.clearStyle = function () {
  clearSelectionStyle();
};

WYSIWYGEditorEditor.prototype.insertLink = function () {
  // Get the caret position
  const { sel, range } = getSelection();

  // Show the modal
  const modal = new WYSIWYGEditorModal(this.ctx, {
    title: "Insérer un lien",
    fields: [
      createInputModalField("Texte à afficher", "text", range.toString()),
      createInputModalField("URL du lien", "href"),
      createCheckboxModalField("Ouvrir dans une nouvelle fenêtre", "openInNewTab", true),
    ],
    callback: (data) => {
      // Check if we have something
      if (data === null) {
        // Nothing to do
        return;
      }

      // Restore the selection
      restoreSelection({ sel, range });

      // Insert a link
      wrapInsideLink(data.text, data.href, data.openInNewTab);
    },
  });
  modal.show();
};

WYSIWYGEditorEditor.prototype.toggleCodeView = function () {
  // Check the current mode
  if (this.mode === EditorModes.Visual) {
    // Switch mode
    this.mode = EditorModes.Code;

    // Hide the visual editor
    this.editors.visual.classList.add("wysiwyg-editor-hidden");

    // Display the code editor
    this.editors.code.classList.remove("wysiwyg-editor-hidden");
    const codeMirrorEl = document.createElement("div");
    this.editors.code.append(codeMirrorEl);
    this.codeMirror = new CodeMirror(codeMirrorEl, this.codeMirrorOptions);
    this.codeMirror.setValue(this.editors.visual.innerHTML);
  } else {
    // Switch mode
    this.mode = EditorModes.Visual;

    // Hide the code editor
    this.editors.code.classList.add("wysiwyg-editor-hidden");

    // Display the visual editor
    this.editors.visual.classList.remove("wysiwyg-editor-hidden");
    this.editors.visual.innerHTML = this.codeMirror.getValue();
    this.codeMirror = null;
    this.editors.code.innerHTML = "";
  }

  // Trigger an event with the new mode
  this.ctx.trigger(Events.modeChanged, { mode: this.mode });
};

WYSIWYGEditorEditor.prototype.onKeyEvent = function (e) {
  // Check if a Meta key is pressed
  const prevent = e.metaKey || e.ctrlKey ? this._processKeyEventWithMeta(e) : this._processKeyEvent(e);

  // Check if we must stop the event here
  if (prevent) {
    e.preventDefault();
    e.stopPropagation();
  }
};

WYSIWYGEditorEditor.prototype._processKeyEvent = function (e) {
  // Check the key code
  switch (e.keyCode) {
    // Enter : 13
    case 13:
      if (e.type === "keydown") {
        // Insert a line break
        replaceSelectionByHtml("<br />");
      }

      // Return true
      return true;
  }

  // Return false
  return false;
};

WYSIWYGEditorEditor.prototype._processKeyEventWithMeta = function (e) {
  // Check the key code
  switch (e.keyCode) {
    // Space : 32
    case 32:
      if (e.type === "keydown") {
        // Insert a non-breaking space
        replaceSelectionByHtml('<span class="wysiwyg-nbsp" contenteditable="false">¶</span>');
      }

      // Return true
      return true;
  }

  // Return false
  return false;
};

WYSIWYGEditorEditor.prototype.onPasteEvent = function (e) {
  // Prevent default
  e.preventDefault();
  e.stopPropagation();

  // Get the caret position
  const { sel, range } = getSelection();

  // Check if we try to paste HTML content
  if (!e.clipboardData.types.includes("text/html")) {
    // Get the content as a plain text
    const text = e.clipboardData.getData("text/plain").replace(/[\r\n]+/g, "<br />");

    // Check if the user want to replace the selection
    if (range && !range.collapsed && range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
      // Delete the Current Selection
      range.deleteContents();
    }

    // Insert the text
    range.insertNode(document.createTextNode(text));

    // Nothing more to do
    return;
  }

  // Detect style blocs in parents
  let dest = sel.anchorNode;
  const style = { B: false, I: false, U: false, S: false, Q: false };
  while (!dest.parentNode.classList.contains("wysiwyg-editor-visual")) {
    // Get the parent
    dest = dest.parentNode;

    // Check if it's a style tag
    if (hasTagName(dest, ["b", "i", "u", "s", "q"])) {
      // Update the style
      style[dest.tagName] = true;
    }
  }

  // We have HTML content
  let html = e.clipboardData.getData("text/html").replace(/[\r\n]+/g, " ");

  // Wrap the HTML Content into <html><body></body></html>
  if (!/^<html>\s*<body>/.test(html)) {
    html = "<html><body>" + html + "</body></html>";
  }

  // Clean the Content
  const contents = cleanPastedHtml(html, style);

  // Check if the user want to replace the selection
  if (range && !range.collapsed && range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
    // Delete the Current Selection
    range.deleteContents();
  }

  // Paste the Content into the Editor Content
  const frag = document.createDocumentFragment();
  frag.append(...contents.childNodes);
  range.insertNode(frag);
};

export { WYSIWYGEditorEditor };
