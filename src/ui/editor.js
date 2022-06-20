import { EditorView, basicSetup } from "codemirror";
import { html } from "@codemirror/lang-html";
import { hasClass, hasTagName } from "../core/dom.js";
import {
  wrapInsideTag,
  replaceSelectionByHtml,
  wrapInsideLink,
  clearSelectionStyle,
  cleanPastedHtml,
} from "../core/edit.js";
import { Events } from "../core/event.js";
import { History } from "../core/history.js";
import { EditorModes } from "../core/mode.js";
import { getSelection, restoreSelection, isSelectionInsideNode } from "../core/range.js";
import { throttle } from "../core/throttle.js";
import { EdithModal, createInputModalField, createCheckboxModalField } from "./modal.js";

function EdithEditor(ctx, options) {
  this.ctx = ctx;
  this.content = options.initialContent || "";
  this.height = options.height || 80;
  this.mode = EditorModes.Visual;
  this.editors = {};
  this.codeMirror = null;
  this.history = new History();
  this.throttledSnapshots = throttle(() => this.takeSnapshot(), 3000, { leading: false, trailing: true });

  // Replace &nbsp; by the string we use as a visual return
  this.content = this.content.replace(/&nbsp;/g, '<span class="edith-nbsp" contenteditable="false">¶</span>');
}

EdithEditor.prototype.render = function () {
  // Create a wrapper for the editor
  const editorWrapper = document.createElement("div");
  editorWrapper.setAttribute("class", "edith-editing-area");
  editorWrapper.setAttribute("style", `height: ${this.height}px`);

  // Create the visual editor
  this.editors.visual = document.createElement("div");
  this.editors.visual.setAttribute("class", "edith-visual");
  this.editors.visual.setAttribute("contenteditable", "true");
  this.editors.visual.innerHTML = this.content;
  editorWrapper.append(this.editors.visual);

  // Create the code editor
  this.editors.code = document.createElement("div");
  this.editors.code.setAttribute("class", "edith-code edith-hidden");
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

EdithEditor.prototype.getVisualEditorElement = function () {
  return this.editors.visual;
};

EdithEditor.prototype.getCodeEditorElement = function () {
  return this.editors.code;
};

EdithEditor.prototype.setContent = function (content) {
  // Replace &nbsp; by the string we use as a visual return
  content = content.replace(/&nbsp;/g, '<span class="edith-nbsp" contenteditable="false">¶</span>');

  // Check the current mode
  if (this.mode === EditorModes.Visual) {
    // Update the visual editor content
    this.editors.visual.innerHTML = content;
  } else {
    // Update the code editor content
    this.codeMirror.dispatch({
      changes: { from: 0, to: this.codeMirror.state.doc.length, insert: content },
    });
  }
};

EdithEditor.prototype.getContent = function () {
  // Get the visual editor content or the code editor content
  const code =
    this.mode === EditorModes.Visual
      ? this.editors.visual.innerHTML
      : this.codeMirror.state.doc
          .toJSON()
          .map((line) => line.trim())
          .join("\n");

  // Check if there is something in the editor
  if (code === "<p><br></p>") {
    return "";
  }

  // Return clean code
  return code
    .replace(/\u200B/gi, "")
    .replace(/<\/p>\s*<p>/gi, "<br>")
    .replace(/(<p>|<\/p>)/gi, "")
    .replace(/<span[^>]+class="edith-nbsp"[^>]*>[^<]*<\/span>/gi, "&nbsp;")
    .replace(/(?:<br\s?\/?>)+$/gi, "");
};

EdithEditor.prototype.takeSnapshot = function () {
  this.history.push(this.editors.visual.innerHTML);
};

EdithEditor.prototype.restoreSnapshot = function () {
  this.editors.visual.innerHTML = this.history.pop();
};

EdithEditor.prototype.wrapInsideTag = function (tag) {
  if (isSelectionInsideNode(this.editors.visual)) {
    wrapInsideTag(tag);
    this.takeSnapshot();
  }
};

EdithEditor.prototype.replaceByHtml = function (html) {
  if (isSelectionInsideNode(this.editors.visual)) {
    replaceSelectionByHtml(html);
    this.takeSnapshot();
  }
};

EdithEditor.prototype.clearStyle = function () {
  clearSelectionStyle();
  this.takeSnapshot();
};

EdithEditor.prototype.insertLink = function () {
  // Get the caret position
  const { sel, range } = getSelection();

  // Check if the user has selected something
  if (range === undefined) return false;

  // Show the modal
  const modal = new EdithModal(this.ctx, {
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

EdithEditor.prototype.toggleCodeView = function () {
  // Check the current mode
  if (this.mode === EditorModes.Visual) {
    // Switch mode
    this.mode = EditorModes.Code;

    // Hide the visual editor
    this.editors.visual.classList.add("edith-hidden");

    // Display the code editor
    this.editors.code.classList.remove("edith-hidden");
    const codeMirrorEl = document.createElement("div");
    this.editors.code.append(codeMirrorEl);
    this.codeMirror = new EditorView({
      doc: this.editors.visual.innerHTML,
      extensions: [basicSetup, EditorView.lineWrapping, html({ matchClosingTags: true, autoCloseTags: true })],
      parent: codeMirrorEl,
    });
  } else {
    // Switch mode
    this.mode = EditorModes.Visual;

    // Hide the code editor
    this.editors.code.classList.add("edith-hidden");

    // Display the visual editor
    this.editors.visual.classList.remove("edith-hidden");
    this.editors.visual.innerHTML = this.codeMirror.state.doc
      .toJSON()
      .map((line) => line.trim())
      .join("\n");
    this.codeMirror.destroy();
    this.codeMirror = null;
    this.editors.code.innerHTML = "";
  }

  // Trigger an event with the new mode
  this.ctx.trigger(Events.modeChanged, { mode: this.mode });
};

EdithEditor.prototype.onKeyEvent = function (e) {
  // Check if a Meta key is pressed
  const prevent = e.metaKey || e.ctrlKey ? this._processKeyEventWithMeta(e) : this._processKeyEvent(e);

  // Check if we must stop the event here
  if (prevent) {
    e.preventDefault();
    e.stopPropagation();
  }
};

EdithEditor.prototype._processKeyEvent = function (e) {
  // Check the key code
  switch (e.keyCode) {
    case 13: // Enter : 13
      if (e.type === "keydown") {
        this.replaceByHtml("<br />"); // Insert a line break
      }
      return true;
  }

  // Save the editor content
  this.throttledSnapshots();

  // Return false
  return false;
};

EdithEditor.prototype._processKeyEventWithMeta = function (e) {
  // Check the key code
  switch (e.keyCode) {
    case 13: // Enter : 13
      if (e.type === "keydown") {
        this.replaceByHtml("<br />"); // Insert a line break
      }
      return true;

    case 32: // Space : 32
      if (e.type === "keydown") {
        this.replaceByHtml('<span class="edith-nbsp" contenteditable="false">¶</span>'); // Insert a non-breaking space
      }
      return true;

    case 66: // b : 66
      if (e.type === "keydown") {
        this.wrapInsideTag("b"); // Toggle bold
      }
      return true;

    case 73: // i : 73
      if (e.type === "keydown") {
        this.wrapInsideTag("i"); // Toggle italic
      }
      return true;

    case 85: // u : 85
      if (e.type === "keydown") {
        this.wrapInsideTag("u"); // Toggle underline
      }
      return true;

    case 83: // s : 83
      if (e.type === "keydown") {
        this.wrapInsideTag("s"); // Toggle strikethrough
      }
      return true;

    case 90: // z : 90
      if (e.type === "keydown") {
        this.restoreSnapshot(); // Undo
      }
      return true;
  }

  // Return false
  return false;
};

EdithEditor.prototype.onPasteEvent = function (e) {
  // Prevent default
  e.preventDefault();
  e.stopPropagation();

  // Get the caret position
  const { sel, range } = getSelection();

  // Check if the user has selected something
  if (range === undefined) return false;

  // Create the fragment to insert
  const frag = document.createDocumentFragment();

  // Check if we try to paste HTML content
  if (!e.clipboardData.types.includes("text/html")) {
    // Get the content as a plain text & split it by lines
    const lines = e.clipboardData.getData("text/plain").split(/[\r\n]+/g);

    // Add the content as text nodes with a <br> node between each line
    for (let i = 0; i < lines.length; i++) {
      if (frag.length !== 0) {
        frag.append(document.createElement("br"));
      }
      frag.append(document.createTextNode(lines[i]));
    }
  } else {
    // Detect style blocs in parents
    let dest = sel.anchorNode;
    const style = { B: false, I: false, U: false, S: false, Q: false };
    while (!hasClass(dest.parentNode, "edith-visual")) {
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

    // Wrap the HTML content into <html><body></body></html>
    if (!/^<html>\s*<body>/.test(html)) {
      html = "<html><body>" + html + "</body></html>";
    }

    // Clean the content
    const contents = cleanPastedHtml(html, style);

    // Add the content to the frgament
    frag.append(...contents.childNodes);
  }

  // Replace the current selection by the pasted content
  sel.deleteFromDocument();
  range.insertNode(frag);
};

EdithEditor.prototype.destroy = function () {
  // Check the current mode
  if (this.mode === EditorModes.Visual) {
    // Remove the visual editor
    this.editors.visual.remove();
  } else {
    // Remove the code editor
    this.codeMirror.destroy();
    this.codeMirror = null;
    this.editors.code.remove();
  }
};

export { EdithEditor };
