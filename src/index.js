import { WYSIWYGEditorEditor } from "./ui/editor.js";
import { WYSIWYGEditorButton, WYSIWYGEditorButtons } from "./ui/button.js";
import "./css/main.scss";

/*
 * Represents an editor
 * @constructor
 * @param {HTMLElement} element - The <input> element to add the Wysiwyg to.
 * @param {Object} options - Options for the editor.
 */
function WYSIWYGEditor(element, options) {
  // Render the editor in the element
  this.element = element;
  this.element.classList.add("wysiwyg-editor");

  // Create the toolbar
  this.toolbar = document.createElement("div");
  this.toolbar.setAttribute("class", "wysiwyg-editor-toolbar");
  this.element.append(this.toolbar);

  // Create buttons
  options.buttons = options.buttons || {};
  options.toolbar = options.toolbar || [["style", ["bold", "italic", "underline", "strikethrough"]]];
  for (const { 0: group, 1: buttons } of options.toolbar) {
    // Create the button group
    const btnGroup = document.createElement("div");
    btnGroup.setAttribute("id", group);
    btnGroup.setAttribute("class", "wysiwyg-editor-btn-group");
    this.toolbar.append(btnGroup);

    // Add buttons
    for (const buttonId of buttons) {
      // Render the button
      const button = options.buttons[buttonId] || WYSIWYGEditorButtons[buttonId];
      btnGroup.append(button(this).render());
    }
  }

  // Create the editor
  this.editor = new WYSIWYGEditorEditor(this, options);
  this.element.append(this.editor.render());

  // Create the modals
  this.modals = document.createElement("div");
  this.modals.setAttribute("class", "wysiwyg-editor-modals");
  this.element.append(this.modals);
}

WYSIWYGEditor.prototype.on = function (type, listener, options) {
  this.element.addEventListener(type, listener, options);
};

WYSIWYGEditor.prototype.off = function (type, listener, options) {
  this.element.removeEventListener(type, listener, options);
};

WYSIWYGEditor.prototype.trigger = function (type, payload = null) {
  this.element.dispatchEvent(new CustomEvent(type, { detail: payload }));
};

function createWYSIWYGEditor(element, options) {
  return new WYSIWYGEditor(element, options);
}

export { createWYSIWYGEditor, WYSIWYGEditorButton };
