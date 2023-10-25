import { Edith } from "./edith.js";
import { EdithButton } from "./ui/index.js";

export type EdithToolbarOption = [string, string[]][];

export type EdithButtonsOption = { [keyof: string]: (context: Edith) => EdithButton };

export type EdithOptions = {
  height: number;
  resizable: boolean;
  toolbar: EdithToolbarOption;
  buttons: EdithButtonsOption;
  initialContent: string;
};

/**
 * Edith default options
 */
export const DefaultOptions: EdithOptions = {
  /**
   * The editor's height
   *
   * @type {number}
   * @default 80
   */
  height: 80,

  /**
   * Control if the editor can be resized by the user
   *
   * @type {boolean}
   * @default false
   */
  resizable: false,

  /**
   *
   * An array that define which button is shown in the toolbar and how they are grouped.
   *
   * @type {EdithToolbarOption}
   * @example
   *   toolbar: [
   *     ["style", ["bold", "italic", "underline", "strikethrough"]],
   *     ["extra", ["subscript", "superscript"]]
   *   ]
   */
  toolbar: [["style", ["bold", "italic", "underline", "strikethrough"]]],

  /**
   *
   * Associative object with the button name and builder to create it.
   *
   * @type {EdithButtonsOption}
   * @example
   *   buttons: {
   *     bold: (context: Edith) =>
   *       new EdithButton(context, {
   *         icon: "fa-solid fa-bold",
   *         title: "Gras",
   *         onclick: (ctx: Edith, event: Event) => {
   *           ctx.editor.wrapInsideTag("b");
   *         },
   *       }),
   *   }
   */
  buttons: {},

  /**
   * The editor's initial content
   *
   * @type {string}
   * @default ""
   */
  initialContent: "",
};
