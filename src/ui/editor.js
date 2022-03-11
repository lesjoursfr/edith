import CodeMirror from 'codemirror';
import { wrapInsideTag, replaceSelectionByHtml } from '../core/edit';

const WYSIWYGEditorEditorMode = Object.freeze({
  Visual: 1,
  Code: 2
});

const CodeMirrorDefaults = Object.freeze({
  lineWrapping: true,
  lineNumbers: true,
  mode: 'text/html',
  inputStyle: 'contenteditable',
  readOnly: false
});

function WYSIWYGEditorEditor (ctx, options) {
  this.ctx = ctx;
  this.content = options.initialContent || '';
  this.height = options.height || 80;
  this.codeMirrorOptions = Object.assign({}, CodeMirrorDefaults, options.codeMirrorOptions);
  this.mode = WYSIWYGEditorEditorMode.Visual;
  this.editors = {};
  this.codeMirror = null;
}

WYSIWYGEditorEditor.prototype.render = function () {
  // Create a wrapper for the editor
  const editorWrapper = document.createElement('div');
  editorWrapper.setAttribute('class', 'wysiwyg-editor-editing-area');
  editorWrapper.setAttribute('style', `height: ${this.height}px`);

  // Create the visual editor
  this.editors.visual = document.createElement('div');
  this.editors.visual.setAttribute('class', 'wysiwyg-editor-visual');
  this.editors.visual.setAttribute('contenteditable', 'true');
  this.editors.visual.innerHTML = this.content;
  editorWrapper.appendChild(this.editors.visual);

  // Create the code editor
  this.editors.code = document.createElement('div');
  this.editors.code.setAttribute('class', 'wysiwyg-editor-code wysiwyg-editor-hidden');
  editorWrapper.appendChild(this.editors.code);

  // Return the wrapper
  return editorWrapper;
};

WYSIWYGEditorEditor.prototype.wrapInsideTag = function (tag) {
  wrapInsideTag(tag);
};

WYSIWYGEditorEditor.prototype.replaceByHtml = function (html) {
  replaceSelectionByHtml(html);
};

WYSIWYGEditorEditor.prototype.clearStyle = function () {

};

WYSIWYGEditorEditor.prototype.toggleCodeView = function () {
  if (this.mode === WYSIWYGEditorEditorMode.Visual) {
    // Switch mode
    this.mode = WYSIWYGEditorEditorMode.Code;

    // Hide the visual editor
    this.editors.visual.classList.add('wysiwyg-editor-hidden');

    // Display the code editor
    this.editors.code.classList.remove('wysiwyg-editor-hidden');
    const codeMirrorEl = document.createElement('div');
    this.editors.code.appendChild(codeMirrorEl);
    this.codeMirror = new CodeMirror(codeMirrorEl, this.codeMirrorOptions);
    this.codeMirror.setValue(this.editors.visual.innerHTML);
  } else {
    // Switch mode
    this.mode = WYSIWYGEditorEditorMode.Visual;

    // Hide the code editor
    this.editors.code.classList.add('wysiwyg-editor-hidden');

    // Display the visual editor
    this.editors.visual.classList.remove('wysiwyg-editor-hidden');
    this.editors.visual.innerHTML = this.codeMirror.getValue();
    this.codeMirror = null;
    this.editors.code.innerHTML = '';
  }
};

export { WYSIWYGEditorEditor };
