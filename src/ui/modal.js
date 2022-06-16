const EdithModalFieldType = Object.freeze({
  input: 1,
  checkbox: 2,
});

function EdithModal(ctx, options) {
  this.ctx = ctx;
  this.title = options.title;
  this.fields = options.fields || [];
  this.callback = options.callback;
}

EdithModal.prototype.cancel = function (event) {
  event.preventDefault();

  // Call the callback with a null value
  this.callback(null);

  // Close the modal
  this.close();
};

EdithModal.prototype.submit = function (event) {
  event.preventDefault();

  // Call the callback with the input & checkboxes values
  const payload = {};
  for (const el of this.el.querySelectorAll("input")) {
    payload[el.getAttribute("name")] = el.getAttribute("type") === "checkbox" ? el.checked : el.value;
  }
  this.callback(payload);

  // Close the modal
  this.close();
};

EdithModal.prototype.close = function () {
  // Remove the element from the dom
  this.el.remove();
};

EdithModal.prototype.show = function () {
  // Create the modal
  this.el = document.createElement("div");
  this.el.setAttribute("class", "edith-modal");

  // Create the header
  const header = document.createElement("div");
  header.setAttribute("class", "edith-modal-header");
  const title = document.createElement("span");
  title.setAttribute("class", "edith-modal-title");
  title.textContent = this.title;
  header.append(title);

  // Create the content
  const content = document.createElement("div");
  content.setAttribute("class", "edith-modal-content");
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
  const footer = document.createElement("div");
  footer.setAttribute("class", "edith-modal-footer");
  const cancel = document.createElement("button");
  cancel.setAttribute("class", "edith-modal-cancel");
  cancel.setAttribute("type", "button");
  cancel.textContent = "Annuler";
  footer.append(cancel);
  const submit = document.createElement("button");
  submit.setAttribute("class", "edith-modal-submit");
  submit.setAttribute("type", "button");
  submit.textContent = "Valider";
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
};

function createInputModalField(label, name, initialValue = null) {
  return {
    fieldType: EdithModalFieldType.input,
    label,
    name,
    initialValue,
  };
}

function renderInputModalField(field) {
  const el = document.createElement("div");
  el.setAttribute("class", "edith-modal-input");
  const label = document.createElement("label");
  label.textContent = field.label;
  const input = document.createElement("input");
  input.setAttribute("name", field.name);
  input.setAttribute("type", "text");
  if (field.initialValue !== null) {
    input.value = field.initialValue;
  }
  el.append(label);
  el.append(input);
  return el;
}

function createCheckboxModalField(label, name, initialState = false) {
  return {
    fieldType: EdithModalFieldType.checkbox,
    label,
    name,
    initialState,
  };
}

function renderCheckboxModalField(field) {
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

export { EdithModal, createInputModalField, createCheckboxModalField };
