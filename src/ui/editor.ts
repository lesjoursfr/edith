import { html } from "@codemirror/lang-html";
import {
  createNodeWith,
  hasClass,
  hasTagName,
  isHTMLElement,
  isSelfClosing,
  isTextNode,
  removeNodesRecursively,
  throttle,
  unwrapNode,
} from "@lesjoursfr/browser-tools";
import { EditorView, basicSetup } from "codemirror";
import {
  EditorModes,
  Events,
  History,
  cleanPastedHtml,
  clearSelectionStyle,
  getSelection,
  isSelectionInsideNode,
  replaceSelectionByHtml,
  restoreSelection,
  wrapInsideLink,
  wrapInsideTag,
} from "../core/index.js";
import { Edith } from "../edith.js";
import { EdithModal, createCheckboxModalField, createInputModalField } from "./modal.js";

export class EdithEditor {
  private el!: HTMLDivElement;
  private ctx: Edith;
  private content: string;
  private height: number;
  private resizable: boolean;
  private mode: EditorModes;
  private visualEditor!: HTMLDivElement;
  private codeEditor!: HTMLDivElement;
  private codeMirror: EditorView | undefined;
  private history: History;
  public throttledSnapshots: ReturnType<typeof throttle>;

  constructor(ctx: Edith, options: { initialContent: string; height: number; resizable: boolean }) {
    this.ctx = ctx;
    this.content = options.initialContent;
    this.height = options.height;
    this.resizable = options.resizable;
    this.mode = EditorModes.Visual;
    this.history = new History();
    this.throttledSnapshots = throttle(() => this.takeSnapshot(), 3000, { leading: false, trailing: true });

    // Replace &nbsp; by the string we use as a visual return
    this.content = this.content.replace(/&nbsp;/g, '<span class="edith-nbsp" contenteditable="false">¶</span>');
  }

  public render(): HTMLDivElement {
    // Create a wrapper for the editor
    this.el = createNodeWith("div", {
      attributes: {
        class: "edith-editing-area",
        style: this.resizable ? `min-height: ${this.height}px; resize: vertical` : `height: ${this.height}px`,
      },
    });

    // Create the visual editor
    this.visualEditor = createNodeWith("div", {
      innerHTML: this.content,
      attributes: {
        class: "edith-visual",
        contenteditable: "true",
        style: this.resizable ? `min-height: ${this.height - 10}px` : `height: ${this.height - 10}px`,
      },
    });
    this.el.append(this.visualEditor);

    // Create the code editor
    this.codeEditor = createNodeWith("div", {
      attributes: { class: "edith-code edith-hidden" },
    });
    this.el.append(this.codeEditor);

    // Bind events
    const keyEventsListener = this.onKeyEvent.bind(this);
    this.visualEditor.addEventListener("keydown", keyEventsListener);
    this.visualEditor.addEventListener("keyup", keyEventsListener);
    const pasteEventListener = this.onPasteEvent.bind(this);
    this.visualEditor.addEventListener("paste", pasteEventListener);

    // Return the wrapper
    return this.el;
  }

  public getVisualEditorElement(): HTMLElement {
    return this.visualEditor;
  }

  public getCodeEditorElement(): HTMLElement {
    return this.codeEditor;
  }

  public setContent(content: string): void {
    // Replace &nbsp; by the string we use as a visual return
    content = content.replace(/&nbsp;/g, '<span class="edith-nbsp" contenteditable="false">¶</span>');

    // Check the current mode
    if (this.mode === EditorModes.Visual) {
      // Update the visual editor content
      this.visualEditor.innerHTML = content;
    } else {
      // Update the code editor content
      this.codeMirror!.dispatch({
        changes: { from: 0, to: this.codeMirror!.state.doc.length, insert: content },
      });
    }
  }

  public getContent(): string {
    // Get the visual editor content or the code editor content
    const code =
      this.mode === EditorModes.Visual
        ? this.visualEditor.innerHTML
        : this.codeMirror!.state.doc.toJSON()
            .map((line) => line.trim())
            .join("\n");

    // Check if there is something in the editor
    if (code === "<p><br></p>") {
      return "";
    }

    // Remove empty tags
    const placeholder = createNodeWith("div", { innerHTML: code });
    removeNodesRecursively(placeholder, (el) => {
      return (
        isHTMLElement(el) && !isSelfClosing(el.tagName) && (el.textContent === null || el.textContent.length === 0)
      );
    });

    // Remove any style attribute
    for (const el of placeholder.querySelectorAll("[style]")) {
      el.removeAttribute("style");
    }

    // Unwrap span without attributes
    for (const el of placeholder.querySelectorAll("span")) {
      if (el.attributes.length === 0) {
        unwrapNode(el);
      }
    }

    // Return clean code
    return placeholder.innerHTML
      .replace(/\u200B/gi, "")
      .replace(/<\/p>\s*<p>/gi, "<br>")
      .replace(/(<p>|<\/p>)/gi, "")
      .replace(/<span[^>]+class="edith-nbsp"[^>]*>[^<]*<\/span>/gi, "&nbsp;")
      .replace(/(?:<br\s?\/?>)+$/gi, "");
  }

  public takeSnapshot(): void {
    this.history.push(this.visualEditor.innerHTML);
  }

  public restoreSnapshot(): void {
    this.visualEditor.innerHTML = this.history.pop() ?? "";
  }

  public wrapInsideTag<K extends keyof HTMLElementTagNameMap>(tag: K): void {
    if (isSelectionInsideNode(this.visualEditor)) {
      wrapInsideTag(tag);
      this.takeSnapshot();
    }
  }

  public replaceByHtml(html: string): void {
    if (isSelectionInsideNode(this.visualEditor)) {
      replaceSelectionByHtml(html);
      this.takeSnapshot();
    }
  }

  public clearStyle(): void {
    clearSelectionStyle();
    this.takeSnapshot();
  }

  public insertLink(): void {
    // Get the caret position
    const { sel, range } = getSelection();

    // Check if the user has selected something
    if (range === undefined) {
      return;
    }

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
        wrapInsideLink(data.text as string, data.href as string, data.openInNewTab as boolean);
      },
    });
    modal.show();
  }

  public toggleCodeView(): void {
    // Check the current mode
    if (this.mode === EditorModes.Visual) {
      // Switch mode
      this.mode = EditorModes.Code;

      // Hide the visual editor
      this.visualEditor.classList.add("edith-hidden");

      // Display the code editor
      this.codeEditor.classList.remove("edith-hidden");
      const codeMirrorEl = document.createElement("div");
      this.codeEditor.append(codeMirrorEl);
      this.codeMirror = new EditorView({
        doc: this.visualEditor.innerHTML,
        extensions: [basicSetup, EditorView.lineWrapping, html({ matchClosingTags: true, autoCloseTags: true })],
        parent: codeMirrorEl,
      });
    } else {
      // Switch mode
      this.mode = EditorModes.Visual;

      // Hide the code editor
      this.codeEditor.classList.add("edith-hidden");

      // Display the visual editor
      this.visualEditor.classList.remove("edith-hidden");
      this.visualEditor.innerHTML = this.codeMirror!.state.doc.toJSON()
        .map((line) => line.trim())
        .join("\n");
      this.codeMirror!.destroy();
      this.codeMirror = undefined;
      this.codeEditor.innerHTML = "";
    }

    // Trigger an event with the new mode
    this.ctx.trigger(Events.modeChanged, { mode: this.mode });
  }

  public onKeyEvent(e: KeyboardEvent): void {
    // Check if a Meta key is pressed
    const prevent = e.metaKey || e.ctrlKey ? this._processKeyEventWithMeta(e) : this._processKeyEvent(e);

    // Check if we must stop the event here
    if (prevent) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  private _processKeyEvent(e: KeyboardEvent): boolean {
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
  }

  private _processKeyEventWithMeta(e: KeyboardEvent): boolean {
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
  }

  public onPasteEvent(e: ClipboardEvent): void {
    // Prevent default
    e.preventDefault();
    e.stopPropagation();

    // Get the caret position
    const { sel, range } = getSelection();

    // Check if the user has selected something
    if (range === undefined || e.clipboardData === null) {
      return;
    }

    // Create the fragment to insert
    const frag = document.createDocumentFragment();

    // Check if we try to paste HTML content
    if (!e.clipboardData.types.includes("text/html")) {
      // Get the content as a plain text & split it by lines
      const lines = e.clipboardData.getData("text/plain").split(/[\r\n]+/g);

      // Add the content as text nodes with a <br> node between each line
      for (let i = 0; i < lines.length; i++) {
        if (i !== 0) {
          frag.append(document.createElement("br"));
        }
        frag.append(document.createTextNode(lines[i]));
      }
    } else {
      // Detect style blocs in parents
      let dest = (isTextNode(sel.anchorNode!) ? sel.anchorNode!.parentNode : sel.anchorNode) as HTMLElement;
      const style = { B: false, I: false, U: false, S: false, Q: false };
      while (dest !== null && !hasClass(dest, "edith-visual")) {
        // Check if it's a style tag
        if (hasTagName(dest, ["b", "i", "u", "s", "q"])) {
          // Update the style
          style[(dest.tagName as "B", "I", "U", "S", "Q")] = true;
        }

        // Get the parent
        dest = dest.parentNode as HTMLElement;
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
  }

  public destroy(): void {
    this.codeMirror?.destroy();
    this.codeMirror = undefined;
    this.el.remove();
  }
}
