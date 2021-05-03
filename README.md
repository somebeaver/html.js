# html.js

Bare bones dependency-free ES6 HTML templating library in vanilla JS. Features include:

- Nested templates
- i18n string substitution out of the box
- General variable substitution
- File includes (in Electron)

## API Reference

A reference of all public html.js methods is available in
**[DOCS.md](DOCS.md)**.

## Example

```javascript
import { html } from 'html.js'

let markup = await html('/home.html', {'name': 'John'}) // file paths require Electron
document.querySelector('#home').innerHTML(markup)
```

## Merge tags

Use these tags within your `.html` files.

### `{inc{}}`
**Include**. Loads the contents of the file, files ending in `.json` fill be
flattened so that their contents can be included inline within `.html` files.
Supports recursive includes.

```html
<header>
  {inc{/path/to/header.html}}
</header>
```

### `{i18n{}}` 
**Internationalization**. Morphs into a string using the global `window.i18n`
strings. The language is set at the function call level, not at the template
level.

```html
<div title="{i18n{string-key}}"></div>
```

### `{{}}`
**General variable replacement**. If the variable does not exist in the
replacements object, or is null or undefined, the merge tag will be substituted
with an empty string.

```html
<span>{{personName}}</span>
```

This module will also automatically remove all <!-- --> comments.

**Important:** When writing stringified arrays and objects directly into elements, always use single quotes
for the attribute and double quotes for the inner items. Double quotes are the only valid JSON
quotes. Example:

```html
// good
<custom-element cols='["track_num", "title"]'></custom-element>

// bad
<custom-element cols="['track_num', 'title']"></custom-element>
```

## License

Licensed under the Mozilla Public License 2.0.