import test from 'tape'
import {rehype} from 'rehype'
import {u} from 'unist-builder'
import {h} from 'hastscript'
import rehypeMeta from 'rehype-meta'
import rehypeInferDescriptionMeta from './index.js'

test('rehypeInferDescriptionMeta', async (t) => {
  t.deepEqual(
    (
      await rehype()
        .use({settings: {fragment: true}})
        .use(rehypeInferDescriptionMeta)
        .process(
          '<div><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></div>'
        )
    ).data,
    {
      meta: {
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim…'
      }
    },
    'should truncate the document by default'
  )

  t.deepEqual(
    (
      await rehype()
        .use({settings: {fragment: true}})
        .use(rehypeInferDescriptionMeta, {inferDescriptionHast: true})
        .process(
          '<div><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></div>'
        )
    ).data,
    {
      meta: {
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim…',
        descriptionHast: u('root', {data: {quirksMode: false}}, [
          h('div', [
            h(
              'p',
              'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            ),
            h('p', 'Ut enim ad minim…')
          ])
        ])
      }
    },
    'should support `inferDescriptionHast: true`'
  )

  t.deepEqual(
    (
      await rehype()
        .use({settings: {fragment: true}})
        .use(rehypeInferDescriptionMeta, {mainSelector: 'article'})
        .process('<p>Lorem ipsum dolor sit amet.</p>')
    ).data,
    {},
    'should support `mainSelector` to select the body (1)'
  )

  t.deepEqual(
    (
      await rehype()
        .use({settings: {fragment: true}})
        .use(rehypeInferDescriptionMeta, {mainSelector: 'article'})
        .process(
          '<aside><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></aside><article><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></article>'
        )
    ).data,
    {
      meta: {
        description:
          'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in…'
      }
    },
    'should support `mainSelector` to select the body (2)'
  )

  t.deepEqual(
    (
      await rehype()
        .use({settings: {fragment: true}})
        .use(rehypeInferDescriptionMeta, {selector: '.byline'})
        .process(
          '<p class=byline>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'
        )
    ).data,
    {
      meta: {
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      }
    },
    'should support `selector` to select the description'
  )

  t.deepEqual(
    (
      await rehype()
        .use({settings: {fragment: true}})
        .use(rehypeInferDescriptionMeta, {comment: 'summary'})
        .process(
          '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. <!-- summary --> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'
        )
    ).data,
    {
      meta: {
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      }
    },
    'should support `comment` to select the description'
  )

  t.deepEqual(
    (
      await rehype()
        .use({settings: {fragment: true}})
        .use(rehypeInferDescriptionMeta, {ignoreSelector: '.ignore'})
        .process(
          '<p>Lorem ipsum dolor sit amet, <span class=ignore>consectetur adipisicing elit, </span>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>'
        )
    ).data,
    {
      meta: {
        description:
          'Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      }
    },
    'should support `selector` to select the description'
  )

  t.equal(
    String(
      await rehype()
        .use(rehypeInferDescriptionMeta)
        .use(rehypeMeta)
        .process(
          '<h1>Hello, world</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'
        )
    ),
    '<html><head>\n<meta name="description" content="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad…">\n</head><body><h1>Hello, world</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></body></html>',
    'should integrate w/ `rehype-meta`'
  )

  t.end()
})
