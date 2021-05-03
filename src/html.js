const htmlDebug = 0
const cache = {}

/**
 * The templating function.
 * 
 * @param {(string|DocumentFragment)} htmlString - A String of HTML content, or the path to a file
 * the local disk. Paths must start with a slash (`/` or `\`). Can also be a
 * DocumentFragment. Either way, a string will be returned.
 * @param {object} replacements - A object of replacement variables for `{{}}` tags. Example: `{'personName': 'Joe'}`
 * @param {string} [lang=en] - Language for the {i18n{}} merge tags. Defaults to English.
 */
export function html(htmlString, replacements = {}, lang = Router.currentLang || 'en') {
  return new Promise(async (resolve, reject) => {

    if (htmlDebug) {
      console.log('----- Now parsing new HTML string -----')
      console.log(htmlString.slice(0, 20))
    }

    if (htmlString instanceof DocumentFragment) {
      let temp = document.createElement('div')
      temp.appendChild(htmlString)
      htmlString = temp.innerHTML
      temp.remove()
    }

    if (typeof htmlString !== 'string' || !htmlString.length) {
      console.warn('html() was given an empty string, or something other than a string')
      resolve(htmlString)
      return
    }

    if (htmlString[0] === '/' || htmlString[0] === '\\') {
      htmlString = await getFileContents(htmlString)
    }

    // parse {inc{}}
    htmlString = await incReplace(htmlString, replacements)

    // remove all HTML comments
    htmlString = stripComments(htmlString)

    // parse general vars {{}}.
    htmlString = generalVarsReplace(htmlString, replacements)
    
    // parse {i18n{}}
    htmlString = i18nReplace(htmlString, lang)
    
    if (htmlDebug) {
      console.log(htmlString.slice(0, 20))
      console.log('^^^^^ Now done parsing ^^^^^')
    }
    
    resolve(htmlString)

  })
}

/**
 * Finds all instances of the given merge tag in the given HTML string.
 * 
 * @param {string} tag - The tag name. For example, `foo` in `{foo{bar.baz}}`.
 * @param {string} htmlString - The string of HTML content to find merge tags in.
 * @returns {array} An array of the contents of the found merge tags. An empty array if none were found.
 * @ignore
 */
function findMergeTags(tag, htmlString) {
  let foundTags = []

  // no matches, return empty array
  if (!htmlString.includes(`{${tag}{`)) {
    return foundTags
  }
  
  // convert the string to an array of parts split on '{tag{'
  let split = htmlString.split(`{${tag}{`)
          
  // all items except the first in the array will begin with a tag until '}}'
  for (let i = 0; i <= split.length - 1; i++) {
    if (i === 0) continue
    
    foundTags.push(split[i].split('}}')[0])
  }

  return foundTags
}

/**
 * Replaces {i18n{translation.key}} merge tags with the correct string from the i18n module.
 * 
 * Strings must already be globalized under `window.i18n`.
 * 
 * @param {string} htmlString - The string of HTML content to find merge tags in.
 * @param {string} lang - Language slug.
 * @ignore
 */
function i18nReplace(htmlString, lang) {
  if (!('i18n' in window)) {
    if (htmlDebug) console.warn('Missing key-value i18n store')
    return
  }

  if (!(lang in window.i18n)) {
    if (htmlDebug) console.warn('Missing lang in i18n key-value store')
    return
  }

  let i18nTags = findMergeTags('i18n', htmlString)

  if (htmlDebug) {
    console.log('Found i18n tags', i18nTags)
  }

  if (!i18nTags.length) {
    return htmlString
  }
    
  // replace the tags with the correct strings
  for (let i18nKey of i18nTags) {
    htmlString = htmlString.replace(`{i18n{${i18nKey}}}`, window.i18n[lang][i18nKey] || i18nKey)
  }

  return htmlString
}

/**
 * Removes <!-- --> comments
 * 
 * @param {string} htmlString - The string of HTML content to remove <!-- --> comments from.
 * @returns {string} Returns the HTML without comments.
 * @ignore
 */
function stripComments(htmlString) {
  return htmlString.replace(/<!--[\s\S]*?-->/g, '')
}

/**
 * Recursively replaces {inc{}} merge tags with the contents of the included file. Files ending
 * in .json will have their whitespace removed (but not within keys and values).
 * 
 * @param {string} htmlString - The string of HTML content to find merge tags in.
 * @param {object} replacements - Replacements object, given to recursive includes.
 * @returns {Promise} - A promise that resolves to the HTML string with all includes loaded in.
 * @ignore
 */
function incReplace(htmlString, replacements) {
  return new Promise(async (recursiveResolve, recursiveReject) => {

    let incTags = findMergeTags('inc', htmlString)

    if (htmlDebug) {
      console.log('Found inc tags', incTags)
    }

    // nothing to do
    if (!incTags.length) {
      recursiveResolve(htmlString)
      return
    }

    // handle one file path at a time
    for (let filePath of incTags) {
      if (htmlDebug) {
        console.log('Now processing include', filePath)
      }

      // one promise per file path. if the file being included contains more includes,
      // this promise will only resolve once all child includes have been included.
      await new Promise(async (resolve, reject) => {
        let fileContents

        // this is the one exception to the rule about the Bridge being the only thing allowed to
        // use the Node modules directly. no point in using ipc for template lookups.
        // TODO if Echoes releases on the web, this needs to look for templates on a web server.
        try {
          if (filePath.slice(-5) === '.json') {
            fileContents = await getJSONFromFile(filePath, 'string')
          } else {
            // recursive action
            fileContents = await html(await getFileContents(filePath), replacements)
          }

          if (htmlDebug) {
            console.log('File contents for path', filePath, ':', fileContents)
          }
          
          htmlString = htmlString.replace(`{inc{${filePath}}}`, fileContents)
          
          resolve()
        } catch (err) {
          console.log(err)
          reject()
        }
      })
    }

    recursiveResolve(htmlString)
      
  })
}

/**
 * Replaces {{variable}} general variables with the ones from the replacements object.
 * 
 * @param {string} htmlString - The string of HTML content to find merge tags in.
 * @param {object} replacements - Replacements object.
 * @ignore
 */
function generalVarsReplace(htmlString, replacements) {
  if (!Object.keys(replacements).length) {
    return htmlString
  }

  let varTags = findMergeTags('', htmlString)

  if (htmlDebug) {
    console.log('Found var tags', varTags)
  }

  if (!varTags.length) {
    return htmlString
  }
    
  // replace the tags with the correct strings
  for (let variableName of varTags) {
    if (variableName in replacements) {
      let toInsert = replacements[variableName]

      // if the variable to insert is null or undefined, convert it to an empty string, which will
      // overwrite the tag instead of inserting the string 'null' or 'undefined'
      if (toInsert === null || toInsert === undefined) {
        toInsert = ''
      }

      htmlString = htmlString.replace(`{{${variableName}}}`, toInsert)
    }
  }

  return htmlString
}

/**
 * Gets the raw contents of a text file on the local disk. Must be running in
 * Electron for this to work.
 *
 * @param {string} path - File path.
 * @param {boolean} [force] - Skip the cache and read the file from the disk.
 */
export function getFileContents(path, force = false) {
  return new Promise((resolve, reject) => {
    if (typeof require !== 'function') {
      throw new Error('html.js does not have access to the file system')
    }
    
    const fs = require('fs')
    
    if (typeof fs !== 'object') {
      throw new Error('html.js does not have access to the file system')
    }

    if (!(path in cache) || force) {
      try  {
        let fileContents = fs.readFileSync(__dirname + path, 'utf8')

        cache[path] = fileContents
        
        resolve(fileContents)
      } catch (error) {
        console.warn(error)
        reject()
      }
    } else {  
      resolve(cache[path])
    }
  })
}

/**
 * Gets JSON file contents. This will ensure that the contents of the file are
 * valid JSON, and it will return the JSON.
 * 
 * @param {string} path - File path on the local disk.
 * @param {string} [returnAs] - `string` or `object`. Defaults to `object`.
 * @param {boolean} [force] - Skip the cache and read the file from the disk.
 * @returns {object}
 */
export function getJSONFromFile(path, returnAs = 'object', force = false) {
  return new Promise(async (resolve, reject) => {
    try {
      let fileContents = await getFileContents(path, force)

      // ensure it's valid JSON by trying to parse it
      let jsonObj = JSON.parse(fileContents.trim())

      if (returnAs === 'string') {
        // stringifying back (instead of returning fileContents) will ensure the
        // object is perfectly formatted for template embedding
        resolve(JSON.stringify(jsonObj))
      } else if (returnAs === 'object') {
        resolve(jsonObj)
      }
    } catch (e) {
      console.log(e)
      throw new Error('JSON file contained invalid JSON: ' + path)
    }
  })
}