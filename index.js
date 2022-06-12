/**
 * @typedef {import('./complex-types.js')} DoNotTouchThisAsItIncludesAugmentation
 *
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 *
 * @typedef Options
 *   Configuration.
 * @property {string} [selector]
 *   CSS selector to the description.
 *   One of the strategies is to look for a certain element, useful if the
 *   description is nicely encoded in one element.
 * @property {string} [comment='more']
 *   String to look for in a comment.
 *   One of the strategies is to look for this comment, everything before it is
 *   the description.
 * @property {number} [truncateSize=140]
 *   Number of characters to truncate to.
 *   One of the strategies is to truncate the document to a certain number of
 *   characters.
 * @property {string} [mainSelector]
 *   CSS selector to body of content.
 *   Useful to exclude other things, such as the head, ads, styles, scripts, and
 *   other random stuff, by focussing all strategies in one element.
 * @property {string} [ignoreSelector='h1, script, style, noscript, template']
 *   CSS selector of nodes to ignore.
 *   Used when looking for an excerpt comment or truncating the document.
 * @property {number} [maxExcerptSearchSize=2048]
 *   How far to search for the excerpt comment before bailing.
 *   The goal of explicit excerpts is that they are assumed to be somewhat
 *   reasonably placed.
 *   This option prevents searching giant documents for some comment that
 *   probably won’t be found at the end.
 * @property {boolean} [inferDescriptionHast=false]
 *   Whether to expose `file.data.meta.descriptionHast`.
 *   This is not used by `rehype-meta`, but could be useful to other plugins.
 */

import {removePosition} from 'unist-util-remove-position'
import {select, selectAll} from 'hast-util-select'
import {toText} from 'hast-util-to-text'
import {excerpt} from 'hast-util-excerpt'
import {truncate} from 'hast-util-truncate'

/**
 * Plugin to infer file metadata from the document.
 *
 * @type {import('unified').Plugin<[Options?]|Array<void>, Root>}
 */
export default function rehypeInferDescriptionMeta(options = {}) {
  const {
    selector,
    comment = 'more',
    truncateSize = 140,
    mainSelector,
    ignoreSelector = 'h1, script, style, noscript, template',
    maxExcerptSearchSize,
    inferDescriptionHast = false
  } = options

  return (tree, file) => {
    const ignore = selectAll(ignoreSelector, tree)
    const main = mainSelector ? select(mainSelector, tree) : tree
    /** @type {Root|Element|undefined|null} */
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
      fragment = truncate(main, {ignore, size: truncateSize, ellipsis: '…'})
    }

    if (fragment) {
      const matter = /** @type {Record<string, unknown>} */ (
        file.data.matter || {}
      )
      const meta = file.data.meta || (file.data.meta = {})

      removePosition(fragment, true)

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
