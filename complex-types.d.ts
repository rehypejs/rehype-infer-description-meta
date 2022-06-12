import type {Root, Element} from 'hast'

// Need a random export to turn this into a module?
export type Whatever = unknown

declare module 'vfile' {
  interface DataMap {
    meta: {
      /**
       * Description of this document.
       *
       * Populated by `rehype-infer-description-meta` from the HTML.
       */
      description?: string

      /**
       * Description of this document, in hast form.
       *
       * Populated by `rehype-infer-description-meta` from the HTML.
       */
      descriptionHast?: Root | Element
    }
  }
}
