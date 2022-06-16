[![NPM version](https://badge.fury.io/js/wysiwyg-editor.svg)](http://badge.fury.io/js/wysiwyg-editor)
[![Build Status](https://travis-ci.org/lesjoursfr/wysiwyg-editor.svg?branch=master)](https://travis-ci.org/lesjoursfr/wysiwyg-editor)

# wysiwyg-editor.js

Simple WYSIWYG editor.

# Requirements

To work this library needs :

-   [CodeMirror](https://www.npmjs.com/package/codemirror) **6.x**
-   [Popper](https://www.npmjs.com/package/@popperjs/core) **2.x**

# How to use

```html
<link rel="stylesheet" href="wysiwyg-editor.css" />
<script type="text/javascript" src="wysiwyg-editor.js"></script>
<script type="text/javascript">
	/* Initialize the WYSIWYG Editor */
	WYSIWYGEditor.createWYSIWYGEditor(document.querySelector("#editor"), {
		height: 200,
		toolbar: [
			["style", ["bold", "italic", "underline", "strikethrough", "subscript", "superscript", "nbsp", "clear"]],
			/*** Other toolbar blocs ***/
		],
		buttons: {
			/*** Extra buttons for the toolbar ***/
		},
		initialContent: "Optional initial content",
	});
</script>
```
