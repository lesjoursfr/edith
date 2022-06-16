[![npm version](https://badge.fury.io/js/@lesjoursfr%2Fedith.svg)](https://badge.fury.io/js/@lesjoursfr%2Fedith)
[![Build Status](https://travis-ci.org/lesjoursfr/edith.svg?branch=master)](https://travis-ci.org/lesjoursfr/edith)

# edith.js

Edith, simple WYSIWYG editor.

# Requirements

To work this library needs :

-   [codemirror](https://www.npmjs.com/package/codemirror) **6.x**
-   [@codemirror/lang-html](https://www.npmjs.com/package/@codemirror/lang-html) **6.x**
-   [@popperjs/core](https://www.npmjs.com/package/@popperjs/core) **2.x**
-   [@fortawesome/fontawesome-free](https://www.npmjs.com/package/@fortawesome/fontawesome-free) **6.x**

# How to use

```javascript
import { Edith } from "@lesjoursfr/edith";

/* Initialize the WYSIWYG Editor */
new Edith(document.querySelector("#editor"), {
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
```
