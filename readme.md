# rehype-infer-description-meta

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[rehype][]** plugin to infer the description of a document.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(rehypeInferDescriptionMeta, options?)`](#unifieduserehypeinferdescriptionmeta-options)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [unified][] ([rehype][]) plugin to infer the description of a
document.
It supports different methods: a specific element, everything up to a comment,
or up to a certain number of characters.

**unified** is a project that transforms content with abstract syntax trees
(ASTs).
**rehype** adds support for HTML to unified.
**vfile** is the virtual file interface used in unified.
**hast** is the HTML AST that rehype uses.
This is a rehype plugin that inspects hast and adds metadata to vfiles.

## When should I use this?

This plugin is particularly useful in combination with
[`rehype-meta`][rehype-meta].
When both are used together, a `<meta name=description>` is populated with the
document’s description.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
In Node.js (version 12.20+, 14.14+, 16.0+, or 18.0+), install with [npm][]:

```sh
npm install rehype-infer-description-meta
```

In Deno with [`esm.sh`][esmsh]:

```js
import rehypeInferDescriptionMeta from 'https://esm.sh/rehype-infer-description-meta@1'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import rehypeInferDescriptionMeta from 'https://esm.sh/rehype-infer-description-meta@1?bundle'
</script>
```

## Use

Say our module `example.js` looks as follows:

```js
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeInferDescriptionMeta from 'rehype-infer-description-meta'
import rehypeDocument from 'rehype-document'
import rehypeMeta from 'rehype-meta'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'

const examples = [
  // Example where the description is in a certain element.
  `<h1>Hello, world!</h1>
  <p class="byline">Lorem ipsum</p>
  <p>Dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>`,
  // Example where the description runs from the start to a comment.
  `<h1>Hello, world!</h1>
  <p>Lorem ipsum<!--more--> dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>`,
  // Example where the description runs from the start to a certain number of characters.
  `<h1>Hello, world!</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>`
]

examples.map((example) => main(example))

async function main(example) {
  const file = await unified()
    .use(rehypeParse, {fragment: true})
    .use(rehypeInferDescriptionMeta, {selector: '.byline'})
    .use(rehypeDocument)
    .use(rehypeMeta)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(example)

  console.log(String(file))
}
```

…now running `node example.js` yields:

> 👉 **Note**: observe each `meta[name="description"]` being derived from `body`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Lorem ipsum">
  </head>
  <body>
    <h1>Hello, world!</h1>
    <p class="byline">Lorem ipsum</p>
    <p>Dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </body>
</html>

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Lorem ipsum">
  </head>
  <body>
    <h1>Hello, world!</h1>
    <p>Lorem ipsum<!--more--> dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </body>
</html>

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad…">
  </head>
  <body>
    <h1>Hello, world!</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </body>
</html>
```

## API

This package exports no identifiers.
The default export is `rehypeInferDescriptionMeta`.

### `unified().use(rehypeInferDescriptionMeta, options?)`

Infer the description from a document as file metadata.
The result is stored on `file.data.meta.description`.
It’s inferred through three strategies:

1.  If `options.selector` is set and an element for that found, then the
    description is the text of that element
2.  Otherwise, if a comment is found with the text of `options.comment`, then
    the description is the text up to that comment
3.  Otherwise, the description is the text up to `options.truncateSize`

##### `options`

Configuration (optional).

##### `options.selector`

CSS selector to the description (`string`, optional, example: `'.byline'`).
One of the strategies is to look for a certain element, useful if the
description is nicely encoded in one element.

##### `options.comment`

String to look for in a comment (`string`, default: `'more'`).
One of the strategies is to look for this comment, everything before it is
the description.

##### `options.truncateSize`

Number of characters to truncate to (`number`, default: `140`).
One of the strategies is to truncate the document to a certain number of
characters.

##### `options.mainSelector`

CSS selector to body of content (`string`, optional, example: `'main'`).
Useful to exclude other things, such as the head, ads, styles, scripts, and
other random stuff, by focussing all strategies in one element.

##### `options.ignoreSelector`

CSS selector of nodes to ignore (`string`, default: `'h1, script, style,
noscript, template'`).
Used when looking for an excerpt comment or truncating the document.

##### `options.maxExcerptSearchSize`

How far to search for the excerpt comment before bailing (`number`, default:
`2048`).
The goal of explicit excerpts is that they are assumed to be somewhat reasonably
placed.
This option prevents searching giant documents for some comment that probably
won’t be found at the end.

##### `options.inferDescriptionHast`

Whether to also expose `file.data.meta.descriptionHast` (`boolean`, default:
`false`).
This is not used by `rehype-meta`, but could be useful to other plugins.
The value at `descriptionHast` contains the rich HTML elements rather than the
plain text content.

## Types

This package is fully typed with [TypeScript][].
The additional type `Options` is exported.

It also registers the `file.data.meta` fields with `vfile`.
If you’re working with the file, make sure to import this plugin somewhere in
your types, as that registers the new fields on the file.

```js
/**
 * @typedef {import('rehype-infer-title-meta')}
 */

import {VFile} from 'vfile'

const file = new VFile()

console.log(file.data.meta.description) //=> TS now knows that this is a `string?`.
```

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

This plugin works with `rehype-parse` version 3+, `rehype-stringify` version 3+,
`rehype` version 4+, and `unified` version 6+.

## Security

Use of `rehype-infer-description-meta` is safe.

## Related

*   [`rehype-document`](https://github.com/rehypejs/rehype-document)
    — wrap a fragment in a document
*   [`rehype-meta`](https://github.com/rehypejs/rehype-meta)
    — add metadata to the head of a document
*   [`unified-infer-git-meta`](https://github.com/unifiedjs/unified-infer-git-meta)
    — infer file metadata from Git
*   [`rehype-infer-title-meta`](https://github.com/rehypejs/rehype-infer-title-meta)
    — infer file metadata from the title of a document
*   [`rehype-infer-reading-time-meta`](https://github.com/rehypejs/rehype-infer-reading-time-meta)
    — infer file metadata from the reading time of a document

## Contribute

See [`contributing.md`][contributing] in [`rehypejs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/rehypejs/rehype-infer-description-meta/workflows/main/badge.svg

[build]: https://github.com/rehypejs/rehype-infer-description-meta/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/rehypejs/rehype-infer-description-meta.svg

[coverage]: https://codecov.io/github/rehypejs/rehype-infer-description-meta

[downloads-badge]: https://img.shields.io/npm/dm/rehype-infer-description-meta.svg

[downloads]: https://www.npmjs.com/package/rehype-infer-description-meta

[size-badge]: https://img.shields.io/bundlephobia/minzip/rehype-infer-description-meta.svg

[size]: https://bundlephobia.com/result?p=rehype-infer-description-meta

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/rehypejs/rehype/discussions

[npm]: https://docs.npmjs.com/cli/install

[esmsh]: https://esm.sh

[health]: https://github.com/rehypejs/.github

[contributing]: https://github.com/rehypejs/.github/blob/main/contributing.md

[support]: https://github.com/rehypejs/.github/blob/main/support.md

[coc]: https://github.com/rehypejs/.github/blob/main/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[typescript]: https://www.typescriptlang.org

[unified]: https://github.com/unifiedjs/unified

[rehype]: https://github.com/rehypejs/rehype

[rehype-meta]: https://github.com/rehypejs/rehype-meta
