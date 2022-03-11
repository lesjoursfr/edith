import { createPopper } from '@popperjs/core';

function onButtonClick (context, kind, event) {
  switch (kind) {
    case 'bold':
      context.editor.wrapInsideTag('b');
      break;
    case 'italic':
      context.editor.wrapInsideTag('i');
      break;
    case 'underline':
      context.editor.wrapInsideTag('u');
      break;
    case 'strikethrough':
      context.editor.wrapInsideTag('s');
      break;
    case 'subscript':
      context.editor.wrapInsideTag('sub');
      break;
    case 'superscript':
      context.editor.wrapInsideTag('sup');
      break;
    case 'nbsp':
      context.editor.replaceByHtml('<span class="wysiwyg-nbsp" contenteditable="false">&para;</span>');
      break;
    case 'clear':
      context.editor.clearStyle();
      break;
    case 'link':
      break;
    case 'codeview':
      context.editor.toggleCodeView();
      break;
  }
}

function WYSIWYGEditorButton (ctx, options) {
  this.ctx = ctx;
  this.icon = options.icon;
  this.title = options.title;
  this.onclick = options.onclick;
}

WYSIWYGEditorButton.prototype.click = function (event) {
  event.preventDefault();
  if (typeof this.onclick === 'string') {
    onButtonClick(this.ctx, this.onclick, event);
  } else {
    this.onclick(this.ctx, event);
  }
};

WYSIWYGEditorButton.prototype.showTooltip = function () {
  if (this.popper !== undefined) { return; }

  // Add the tooltip content to the DOM
  this.popperEl = document.createElement('div');
  this.popperEl.setAttribute('class', 'wysiwyg-editor-tooltip');
  this.popperEl.textContent = this.title;
  const arrowEl = document.createElement('div');
  arrowEl.setAttribute('class', 'arrow');
  arrowEl.setAttribute('data-popper-arrow', '');
  this.popperEl.appendChild(arrowEl);
  this.ctx.toolbar.appendChild(this.popperEl);

  // Create the tooltip
  this.popper = createPopper(this.el, this.popperEl, {
    placement: 'bottom',
    modifiers: [
      {
        name: 'arrow',
        options: {
          padding: 5 // 5px from the edges of the popper
        }
      },
      {
        name: 'offset',
        options: {
          offset: [0, 8]
        }
      }
    ]
  });
};

WYSIWYGEditorButton.prototype.hideTooltip = function () {
  if (this.popper === undefined) { return; }

  // Destroy the tooltip
  this.popper.destroy();
  this.popper = undefined;

  // Remove the tooltip content from the DOM
  this.popperEl.remove();
};

WYSIWYGEditorButton.prototype.render = function () {
  // Create the button
  this.el = document.createElement('button');
  this.el.setAttribute('class', `wysiwyg-editor-btn ${this.icon}`);
  this.el.setAttribute('type', 'button');

  // Bind events
  this.el.onclick = this.click.bind(this);
  this.el.onmouseenter = this.showTooltip.bind(this);
  this.el.onmouseleave = this.hideTooltip.bind(this);

  // Return the button
  return this.el;
};

const WYSIWYGEditorButtons = {
  bold: (context) => new WYSIWYGEditorButton(context, {
    icon: 'fa-solid fa-bold',
    title: 'Gras',
    onclick: 'bold'
  }),
  italic: (context) => new WYSIWYGEditorButton(context, {
    icon: 'fa-solid fa-italic',
    title: 'Italique',
    onclick: 'italic'
  }),
  underline: (context) => new WYSIWYGEditorButton(context, {
    icon: 'fa-solid fa-underline',
    title: 'Souligner',
    onclick: 'underline'
  }),
  strikethrough: (context) => new WYSIWYGEditorButton(context, {
    icon: 'fa-solid fa-strikethrough',
    title: 'Barrer',
    onclick: 'strikethrough'
  }),
  subscript: (context) => new WYSIWYGEditorButton(context, {
    icon: 'fa-solid fa-subscript',
    title: 'Indice',
    onclick: 'subscript'
  }),
  superscript: (context) => new WYSIWYGEditorButton(context, {
    icon: 'fa-solid fa-superscript',
    title: 'Exposant',
    onclick: 'superscript'
  }),
  nbsp: (context) => new WYSIWYGEditorButton(context, {
    icon: 'wysiwyg-editor-btn-nbsp',
    title: 'Ajouter une espace insécable',
    onclick: 'nbsp'
  }),
  clear: (context) => new WYSIWYGEditorButton(context, {
    icon: 'fa-solid fa-eraser',
    title: 'Effacer la mise en forme',
    onclick: 'clear'
  }),
  link: (context) => new WYSIWYGEditorButton(context, {
    icon: 'fa-solid fa-link',
    title: 'Lien',
    onclick: 'link'
  }),
  codeview: (context) => new WYSIWYGEditorButton(context, {
    icon: 'fa-solid fa-code',
    title: 'Afficher le code HTML',
    onclick: 'codeview'
  })
};

export { WYSIWYGEditorButton, WYSIWYGEditorButtons };
