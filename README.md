# html.js

Basic HTML templating library in vanilla JS. This module provides a default
export `html`.

## Example

```javascript
import html from 'html.js'

let markup = await html('/home.html', {'name': 'John'})
document.querySelector('#home').innerHTML(markup)
```

## Merge tags

Use these tags within your `.html` files.

- `{inc{}}` **Include**. Loads the contents of the file, files ending in `.json`
  fill be flattened so that their contents can be included inline within `.html`
  files. Supports recursive includes.

```javascript
{inc{/path/from/root.html}}
```

- `{i18n{}}` **Internationalization**. Morphs into a string using the global
  `window.i18n` strings. The language is set at the function call level, not
  at the template level.

```javascript
{i18n{object.key.for.your.string}}
```

- `{{}}` **General variable replacement**. If the variable does not exist in the
  replacements object, or is null or undefined, the merge tag will be
  substituted with an empty string.

```javascript
{{personName}}
```

This module will also automatically remove all <!-- --> comments.

**Important:** When writing stringified arrays and objects directly into elements, always use single quotes
for the attribute and double quotes for the inner items. Double quotes are the only valid JSON
quotes. Example:

    // good
    <custom-element cols='["track_num", "title"]'></custom-element>

    // bad
    <custom-element cols="['track_num', 'title']"></custom-element>