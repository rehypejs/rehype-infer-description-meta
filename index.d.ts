import type {Element, Root} from 'hast'

export type {Options} from './lib/index.js'
export {default} from './lib/index.js'

interface InferDescriptionMeta {
  /**
   * Description of the document (optional, example: `'The city has changed
   * drastically over the past 40 years, yet the M.T.A. map designed in 1979
   * has largely endured.'`).
   *
   * Inferred by `rehype-infer-description-meta` from HTML.
   * Used by `rehype-meta`.
   */
  description?: string | null | undefined
  /**
   * Description of this document, in hast tree form (optional).
   *
   * Inferred by `rehype-infer-description-meta` from HTML.
   * Used by `rehype-meta`.
   */
  descriptionHast?: Root | Element | null | undefined
}

// Add custom data supported when `rehype-infer-description-meta` is added.
declare module 'vfile' {
  interface DataMapMeta extends InferDescriptionMeta {}

  interface DataMap {
    meta: DataMapMeta
  }
}
