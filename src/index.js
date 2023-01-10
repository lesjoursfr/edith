import { EdithEditor } from "./ui/editor.js";
import { EdithButton, EdithButtons } from "./ui/button.js";

/*
 * Represents an editor
 * @constructor
 * @param {HTMLElement} element - The <input> element to add the Wysiwyg to.
 * @param {Object} options - Options for the editor.
 */
function Edith(element, options) {
  // Render the editor in the element
  this.element = element;
  this.element.classList.add("edith");

  // Create the toolbar
  this.toolbar = document.createElement("div");
  this.toolbar.setAttribute("class", "edith-toolbar");
  this.element.append(this.toolbar);

  // Create buttons
  options.buttons = options.buttons || {};
  options.toolbar = options.toolbar || [["style", ["bold", "italic", "underline", "strikethrough"]]];
  for (const { 0: group, 1: buttons } of options.toolbar) {
    // Create the button group
    const btnGroup = document.createElement("div");
    btnGroup.setAttribute("id", group);
    btnGroup.setAttribute("class", "edith-btn-group");
    this.toolbar.append(btnGroup);

    // Add buttons
    for (const buttonId of buttons) {
      // Render the button
      const button = options.buttons[buttonId] || EdithButtons[buttonId];
      btnGroup.append(button(this).render());
    }
  }

  // Create the editor
  this.editor = new EdithEditor(this, options);
  this.element.append(this.editor.render());

  // Create the modals
  this.modals = document.createElement("div");
  this.modals.setAttribute("class", "edith-modals");
  this.element.append(this.modals);

  // Trigger the initialized event once its initialized
  this.trigger("edith-initialized");
}

Edith.prototype.on = function (type, listener, options) {
  this.element.addEventListener(type, listener, options);
};

Edith.prototype.off = function (type, listener, options) {
  this.element.removeEventListener(type, listener, options);
};

Edith.prototype.trigger = function (type, payload = null) {
  this.element.dispatchEvent(new CustomEvent(type, { detail: payload }));
};

Edith.prototype.setContent = function (content) {
  this.editor.setContent(content);
};

Edith.prototype.getContent = function () {
  return this.editor.getContent();
};

Edith.prototype.destroy = function () {
  // Delete the modals
  this.modals.remove();
  this.modals = undefined;

  // Delete the editor
  this.editor.destroy();
  this.editor = undefined;

  // Delete the toolbar
  this.toolbar.remove();
  this.toolbar = undefined;

  // Clean the main element
  this.element.classList.remove("edith");
  this.element = undefined;
};

export { Edith, EdithButton };
