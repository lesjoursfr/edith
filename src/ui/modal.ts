import { createNodeWith, getAttribute, hasAttribute } from "../core/index.js";
import { Edith } from "../edith.js";

export enum EdithModalFieldType {
  input = 1,
  checkbox = 2,
}

export type EdithModalField = {
  fieldType: EdithModalFieldType;
  label: string;
  name: string;
  initialState: string | boolean | null;
};

function renderInputModalField(field: EdithModalField) {
  const el = document.createElement("div");
  el.setAttribute("class", "edith-modal-input");
  const label = document.createElement("label");
  label.textContent = field.label;
  const input = document.createElement("input");
  input.setAttribute("name", field.name);
  input.setAttribute("type", "text");
  if (field.initialState !== null) {
    input.value = field.initialState.toString();
  }
  el.append(label);
  el.append(input);
  return el;
}

function renderCheckboxModalField(field: EdithModalField) {
  const el = document.createElement("div");
  el.setAttribute("class", "edith-modal-checkbox");
  const label = document.createElement("label");
  label.textContent = field.label;
  const input = document.createElement("input");
  input.setAttribute("name", field.name);
  input.setAttribute("type", "checkbox");
  if (field.initialState) {
    input.checked = true;
  }
  label.prepend(input);
  el.append(label);
  return el;
}

export function createInputModalField(
  label: string,
  name: string,
  initialState: string | null = null
): EdithModalField {
  return {
    fieldType: EdithModalFieldType.input,
    label,
    name,
    initialState,
  };
}

export function createCheckboxModalField(label: string, name: string, initialState: boolean = false): EdithModalField {
  return {
    fieldType: EdithModalFieldType.checkbox,
    label,
    name,
    initialState,
  };
}

export type EdithModalCallback = (payload: { [keyof: string]: string | boolean } | null) => void;

export class EdithModal {
  private el!: HTMLDivElement;
  private ctx: Edith;
  private title: string;
  private fields: EdithModalField[];
  private callback: EdithModalCallback;

  constructor(ctx: Edith, options: { title: string; fields?: EdithModalField[]; callback: EdithModalCallback }) {
    this.ctx = ctx;
    this.title = options.title;
    this.fields = options.fields || [];
    this.callback = options.callback;
  }

  public cancel(event: Event): void {
    event.preventDefault();

    // Call the callback with a null value
    this.callback(null);

    // Close the modal
    this.close();
  }

  public submit(event: Event): void {
    event.preventDefault();

    // Call the callback with the input & checkboxes values
    const payload: { [keyof: string]: string | boolean } = {};
    for (const el of this.el.querySelectorAll("input")) {
      if (hasAttribute(el, "name")) {
        payload[getAttribute(el, "name")!] = getAttribute(el, "type") === "checkbox" ? el.checked : el.value;
      }
    }
    this.callback(payload);

    // Close the modal
    this.close();
  }

  public close(): void {
    // Remove the element from the dom
    this.el.remove();
  }

  public show(): HTMLDivElement {
    // Create the modal
    this.el = createNodeWith("div", {
      attributes: { class: "edith-modal" },
    });

    // Create the header
    const header = createNodeWith("div", {
      attributes: { class: "edith-modal-header" },
    });
    const title = createNodeWith("span", {
      textContent: this.title,
      attributes: { class: "edith-modal-title" },
    });
    header.append(title);

    // Create the content
    const content = createNodeWith("div", {
      attributes: { class: "edith-modal-content" },
    });
    for (const field of this.fields) {
      switch (field.fieldType) {
        case EdithModalFieldType.input:
          content.append(renderInputModalField(field));
          break;
        case EdithModalFieldType.checkbox:
          content.append(renderCheckboxModalField(field));
          break;
        default:
          throw new Error(`Unknown fieldType ${field.fieldType}`);
      }
    }

    // Create the footer
    const footer = createNodeWith("div", {
      attributes: { class: "edith-modal-footer" },
    });
    const cancel = createNodeWith("button", {
      textContent: "Annuler",
      attributes: { class: "edith-modal-cancel", type: "button" },
    });
    footer.append(cancel);
    const submit = createNodeWith("button", {
      textContent: "Valider",
      attributes: { class: "edith-modal-submit", type: "button" },
    });
    footer.append(submit);

    // Append everything
    this.el.append(header);
    this.el.append(content);
    this.el.append(footer);

    // Add the modal to the editor
    this.ctx.modals.append(this.el);

    // Bind events
    cancel.onclick = this.cancel.bind(this);
    submit.onclick = this.submit.bind(this);

    // Return the modal
    return this.el;
  }
}
