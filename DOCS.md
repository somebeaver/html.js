## Functions

<dl>
<dt><a href="#html">html(htmlString, replacements, [lang])</a></dt>
<dd><p>The templating function.</p>
</dd>
<dt><a href="#getFileContents">getFileContents(path, [force])</a></dt>
<dd><p>Gets the raw contents of a text file on the local disk. Must be running in
Electron for this to work.</p>
</dd>
<dt><a href="#getJSONFromFile">getJSONFromFile(path, [returnAs], [force])</a> ⇒ <code>object</code></dt>
<dd><p>Gets JSON file contents. This will ensure that the contents of the file are
valid JSON, and it will return the JSON.</p>
</dd>
</dl>

<a name="html"></a>

## html(htmlString, replacements, [lang])
The templating function.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| htmlString | <code>string</code> \| <code>DocumentFragment</code> |  | A String of HTML content, or the path to a file the local disk. Paths must start with a slash (`/` or `\`). Can also be a DocumentFragment. Either way, a string will be returned. |
| replacements | <code>object</code> |  | A object of replacement variables for `{{}}` tags. Example: `{'personName': 'Joe'}` |
| [lang] | <code>string</code> | <code>&quot;en&quot;</code> | Language for the {i18n{}} merge tags. Defaults to English. |

<a name="getFileContents"></a>

## getFileContents(path, [force])
Gets the raw contents of a text file on the local disk. Must be running in
Electron for this to work.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | File path. |
| [force] | <code>boolean</code> | Skip the cache and read the file from the disk. |

<a name="getJSONFromFile"></a>

## getJSONFromFile(path, [returnAs], [force]) ⇒ <code>object</code>
Gets JSON file contents. This will ensure that the contents of the file are
valid JSON, and it will return the JSON.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | File path on the local disk. |
| [returnAs] | <code>string</code> | `string` or `object`. Defaults to `object`. |
| [force] | <code>boolean</code> | Skip the cache and read the file from the disk. |

