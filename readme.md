# rehype-infer-description-meta

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**rehype**][rehype] plugin to infer file metadata from the document.
This plugin sets `file.data.meta.description`.
This is mostly useful with [`rehype-meta`][rehype-meta].

## Contents

*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(rehypeInferDescriptionMeta, options?)`](#unifieduserehypeinferdescriptionmeta-options)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install rehype-infer-description-meta
```

## Use

Say `example.js` looks as follows:

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

Now, running `node example` yields (note the `meta[name="description"]`):

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

Plugin to infer file metadata of the document’s description.

The description is inferred through three strategies:

1.  If `options.selector` is set and an element for that found, then the
    description is the text of that element
2.  Otherwise, if a comment is found with the text of `options.comment`, then
    the description is the text up to that comment
3.  Otherwise, the description is the text up to `options.truncateSize`

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

Whether to expose `file.data.meta.descriptionHast` (`boolean`, default:
`false`).
This is not used by `rehype-meta`, but could be useful to other plugins.
This description includes the rich HTML elements rather than the plain text
content.

## Security

Use of `rehype-infer-description-meta` is safe.

## Related

*   [`rehype-document`](https://github.com/rehypejs/rehype-document)
    — Wrap a document around a fragment
*   [`rehype-meta`](https://github.com/rehypejs/rehype-meta)
    — Add metadata to the head of a document
*   [`unified-infer-git-meta`](https://github.com/unifiedjs/unified-infer-git-meta)
    — Infer file metadata from Git
*   [`rehype-infer-title-meta`](https://github.com/rehypejs/rehype-infer-title-meta)
    — Infer file metadata from the title of a document
*   [`rehype-infer-reading-time-meta`](https://github.com/rehypejs/rehype-infer-reading-time-meta)
    — Infer file metadata from the reading time of a document

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

[health]: https://github.com/rehypejs/.github

[contributing]: https://github.com/rehypejs/.github/blob/HEAD/contributing.md

[support]: https://github.com/rehypejs/.github/blob/HEAD/support.md

[coc]: https://github.com/rehypejs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[rehype]: https://github.com/rehypejs/rehype

[rehype-meta]: https://github.com/rehypejs/rehype-meta
