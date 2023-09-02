/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Root} Root
 *
 * @typedef {import('vfile').VFile} VFile
 *
 * @typedef {import('./complex-types.js')} DoNotTouchThisAsItIncludesAugmentation
 *   To do: remove.
 */

/**
 * @typedef Options
 *   Configuration.
 * @property {string | null | undefined} [comment='more']
 *   String to look for in a comment (default: `'more'`); one of the strategies
 *   is to look for this comment, everything before it is the description.
 * @property {string | null | undefined} [ignoreSelector='h1, script, style, noscript, template']
 *   CSS selector of nodes to ignore (default: `'h1, script, style, noscript,
 *   template'`); used when looking for an excerpt comment or truncating the
 *   document.
 * @property {boolean | null | undefined} [inferDescriptionHast=false]
 *   Whether to expose `file.data.meta.descriptionHast` (default: `false`);
 *   this is not used by `rehype-meta`, but could be useful to other plugins.
 * @property {string | null | undefined} [mainSelector]
 *   CSS selector to body of content (optional); useful to exclude other
 *   things, such as the head, ads, styles, scripts, and other random stuff, by
 *   focussing all strategies in one element.
 * @property {number | null | undefined} [maxExcerptSearchSize=2048]
 *   How far to search for the excerpt comment before bailing (default:
 *   `2048`); the goal of explicit excerpts is that they are assumed to be
 *   somewhat reasonably placed; this option prevents searching giant documents
 *   for some comment that probably won’t be found at the end.
 * @property {string | null | undefined} [selector]
 *   CSS selector to the description (optional); one of the strategies is to
 *   look for a certain element, useful if the description is nicely encoded
 *   in one element.
 * @property {number | null | undefined} [truncateSize=140]
 *   Number of characters to truncate to (default: `140`); one of the
 *   strategies is to truncate the document to a certain number of characters.
 */

import {excerpt} from 'hast-util-excerpt'
import {select, selectAll} from 'hast-util-select'
import {toText} from 'hast-util-to-text'
import {truncate} from 'hast-util-truncate'
import {removePosition} from 'unist-util-remove-position'

/** @type {Options} */
const emptyOptions = {}

/**
 * Infer file metadata from the description of a document.
 *
 * The result is stored on `file.data.meta.description`.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function rehypeInferDescriptionMeta(options) {
  const settings = options || emptyOptions
  const comment = settings.comment || 'more'
  const ignoreSelector =
    settings.ignoreSelector || 'h1, script, style, noscript, template'
  const inferDescriptionHast = settings.inferDescriptionHast || false
  const mainSelector = settings.mainSelector || undefined
  const maxExcerptSearchSize = settings.maxExcerptSearchSize || 2048
  const selector = settings.selector || undefined
  const truncateSize = settings.truncateSize || 140

  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @param {VFile} file
   *   File
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree, file) {
    const ignore = selectAll(ignoreSelector, tree)
    const main = mainSelector ? select(mainSelector, tree) : tree
    /** @type {Root | Element | undefined} */
    let fragment

    if (main && selector) {
      fragment = select(selector, main)
    }

    if (main && comment && !fragment) {
      fragment = excerpt(main, {
        comment,
        ignore,
        maxSearchSize: maxExcerptSearchSize
      })
    }

    if (main && typeof truncateSize === 'number' && !fragment) {
      fragment = truncate(main, {ellipsis: '…', ignore, size: truncateSize})
    }

    if (fragment) {
      const matter = /** @type {Record<string, unknown>} */ (
        file.data.matter || {}
      )
      const meta = file.data.meta || (file.data.meta = {})

      removePosition(fragment, {force: true})

      if (!matter.description && !meta.description) {
        meta.description = toText(fragment)
          .replace(/[\t\r\n ]+…[\t \r\n]*$/, '…')
          .replace(/[\t ]*[\r\n][\t ]*/, '\n')
          .replace(/[\r\n]+/, ' ')
          .trim()
      }

      if (
        !matter.descriptionHast &&
        !meta.descriptionHast &&
        inferDescriptionHast
      ) {
        meta.descriptionHast = fragment
      }
    }
  }
}
