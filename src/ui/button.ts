import { createPopper } from "@popperjs/core";
import { EditorModes, Events, createNodeWith } from "../core/index.js";
import { EdithButtonsOption } from "../edith-options.js";
import { Edith } from "../edith.js";

export type EdithButtonCallback = (ctx: Edith, event: Event) => void;

export class EdithButton {
  private el!: HTMLButtonElement;
  private ctx: Edith;
  private icon: string;
  private title: string;
  private onclick: EdithButtonCallback;
  private showOnCodeView: boolean;
  private popperEl: HTMLDivElement | undefined;
  private popper: ReturnType<typeof createPopper> | undefined;

  constructor(
    ctx: Edith,
    options: { icon: string; title: string; onclick: EdithButtonCallback; showOnCodeView?: boolean }
  ) {
    this.ctx = ctx;
    this.icon = options.icon;
    this.title = options.title;
    this.onclick = options.onclick;
    this.showOnCodeView = options.showOnCodeView === true;
  }

  public click(event: Event): void {
    // Prevent default
    event.preventDefault();

    // Call the callback
    this.onclick(this.ctx, event);
  }

  public showTooltip(): void {
    if (this.popper !== undefined) {
      return;
    }

    // Add the tooltip content to the DOM
    this.popperEl = createNodeWith("div", {
      textContent: this.title,
      attributes: { class: "edith-tooltip" },
    });
    const arrowEl = createNodeWith("div", {
      attributes: { class: "arrow", "data-popper-arrow": "" },
    });
    this.popperEl.append(arrowEl);
    this.ctx.toolbar.append(this.popperEl);

    // Create the tooltip
    this.popper = createPopper(this.el, this.popperEl, {
      placement: "bottom",
      modifiers: [
        {
          name: "arrow",
          options: {
            padding: 5, // 5px from the edges of the popper
          },
        },
        {
          name: "offset",
          options: {
            offset: [0, 8],
          },
        },
      ],
    });
  }

  public hideTooltip(): void {
    if (this.popper === undefined) {
      return;
    }

    // Destroy the tooltip
    this.popper.destroy();
    this.popper = undefined;

    // Remove the tooltip content from the DOM
    this.popperEl?.remove();
  }

  public onEditorModeChange(event: CustomEvent): void {
    if (event.detail.mode === EditorModes.Code) {
      this.el.setAttribute("disabled", "disabled");
    } else {
      this.el.removeAttribute("disabled");
    }
  }

  public render(): HTMLButtonElement {
    // Create the button
    this.el = createNodeWith("button", {
      attributes: { class: `edith-btn ${this.icon}`, type: "button" },
    });

    // Bind events
    this.el.onclick = this.click.bind(this);
    this.el.onmouseenter = this.showTooltip.bind(this);
    this.el.onmouseleave = this.hideTooltip.bind(this);

    // Check if we have to disable the button on the code view
    if (this.showOnCodeView !== true) {
      this.ctx.on(Events.modeChanged, this.onEditorModeChange.bind(this) as EventListener);
    }

    // Return the button
    return this.el;
  }
}

export const EdithButtons = Object.freeze({
  bold: (context: Edith) =>
    new EdithButton(context, {
      icon: "fa-solid fa-bold",
      title: "Gras",
      onclick: (ctx: Edith) => {
        ctx.editor.wrapInsideTag("b");
      },
    }),
  italic: (context: Edith) =>
    new EdithButton(context, {
      icon: "fa-solid fa-italic",
      title: "Italique",
      onclick: (ctx: Edith) => {
        ctx.editor.wrapInsideTag("i");
      },
    }),
  underline: (context: Edith) =>
    new EdithButton(context, {
      icon: "fa-solid fa-underline",
      title: "Souligner",
      onclick: (ctx: Edith) => {
        ctx.editor.wrapInsideTag("u");
      },
    }),
  strikethrough: (context: Edith) =>
    new EdithButton(context, {
      icon: "fa-solid fa-strikethrough",
      title: "Barrer",
      onclick: (ctx: Edith) => {
        ctx.editor.wrapInsideTag("s");
      },
    }),
  subscript: (context: Edith) =>
    new EdithButton(context, {
      icon: "fa-solid fa-subscript",
      title: "Indice",
      onclick: (ctx: Edith) => {
        ctx.editor.wrapInsideTag("sub");
      },
    }),
  superscript: (context: Edith) =>
    new EdithButton(context, {
      icon: "fa-solid fa-superscript",
      title: "Exposant",
      onclick: (ctx: Edith) => {
        ctx.editor.wrapInsideTag("sup");
      },
    }),
  nbsp: (context: Edith) =>
    new EdithButton(context, {
      icon: "edith-btn-nbsp",
      title: "Ajouter une espace insécable",
      onclick: (ctx: Edith) => {
        ctx.editor.replaceByHtml('<span class="edith-nbsp" contenteditable="false">¶</span>');
      },
    }),
  clear: (context: Edith) =>
    new EdithButton(context, {
      icon: "fa-solid fa-eraser",
      title: "Effacer la mise en forme",
      onclick: (ctx: Edith) => {
        ctx.editor.clearStyle();
      },
    }),
  link: (context: Edith) =>
    new EdithButton(context, {
      icon: "fa-solid fa-link",
      title: "Lien",
      onclick: (ctx: Edith) => {
        ctx.editor.insertLink();
      },
    }),
  codeview: (context: Edith) =>
    new EdithButton(context, {
      icon: "fa-solid fa-code",
      title: "Afficher le code HTML",
      onclick: (ctx: Edith) => {
        ctx.editor.toggleCodeView();
      },
      showOnCodeView: true,
    }),
} as EdithButtonsOption);
