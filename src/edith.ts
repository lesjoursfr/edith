import { Events, addClass, createNodeWith, off, on, trigger } from "./core/index.js";
import { DefaultOptions, EdithButtonsOption, EdithOptions, EdithToolbarOption } from "./edith-options.js";
import { EdithButton, EdithButtons, EdithEditor } from "./ui/index.js";

declare global {
  interface HTMLElement {
    edith?: Edith;
  }
}

export { EdithButton };

export class Edith {
  private readonly element: HTMLElement;
  public readonly toolbar: HTMLDivElement;
  public readonly editor: EdithEditor;
  public readonly modals: HTMLDivElement;

  /**
   * Create a new editor
   * @constructor
   * @param {HTMLElement} element - The <input> element to add the Wysiwyg to.
   * @param {Object} options - Options for the editor.
   */
  constructor(element: HTMLElement, options: Partial<EdithOptions>) {
    // Render the editor in the element
    this.element = element;
    addClass(this.element, "edith");

    // Create the toolbar
    this.toolbar = createNodeWith("div", { attributes: { class: "edith-toolbar" } });
    this.element.append(this.toolbar);

    // Create buttons
    const buttons: EdithButtonsOption = options.buttons ?? DefaultOptions.buttons;
    const toolbar: EdithToolbarOption = options.toolbar ?? DefaultOptions.toolbar;
    for (const { 0: group, 1: btns } of toolbar) {
      // Create the button group
      const btnGroup = document.createElement("div");
      btnGroup.setAttribute("id", group);
      btnGroup.setAttribute("class", "edith-btn-group");
      this.toolbar.append(btnGroup);

      // Add buttons
      for (const btnId of btns) {
        // Render the button
        const buttonBuilder = buttons[btnId] ?? EdithButtons[btnId];
        btnGroup.append(buttonBuilder(this).render());
      }
    }

    // Create the editor
    this.editor = new EdithEditor(this, {
      initialContent: options.initialContent ?? DefaultOptions.initialContent,
      height: options.height ?? DefaultOptions.height,
      resizable: options.resizable ?? DefaultOptions.resizable,
    });
    this.element.append(this.editor.render());

    // Create the modals
    this.modals = createNodeWith("div", { attributes: { class: "edith-modals" } });
    this.element.append(this.modals);

    // Add the Edith instance to the DOM
    this.element.edith = this;

    // Trigger the initialized event once its initialized
    this.trigger(Events.initialized);
  }

  public on(type: string, listener: EventListenerOrEventListenerObject): void {
    on(this.element, type, listener);
  }

  public off(type: string, listener: EventListenerOrEventListenerObject): void {
    off(this.element, type, listener);
  }

  public trigger(type: Events, payload?: { [key: string]: unknown }): void {
    trigger(this.element, type, payload);
  }

  public setContent(content: string): void {
    this.editor.setContent(content);
  }

  public getContent(): string {
    return this.editor.getContent();
  }

  public destroy(): void {
    this.modals.remove();
    this.editor.destroy();
    this.toolbar.remove();
    this.element.remove();
  }
}
