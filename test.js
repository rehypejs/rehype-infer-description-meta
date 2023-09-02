import assert from 'node:assert/strict'
import test from 'node:test'
import {h} from 'hastscript'
import {rehype} from 'rehype'
import rehypeInferDescriptionMeta from 'rehype-infer-description-meta'
import rehypeMeta from 'rehype-meta'

test('rehypeInferDescriptionMeta', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(await import('rehype-infer-description-meta')).sort(),
      ['default']
    )
  })

  await t.test('should truncate the document by default', async function () {
    const file = await rehype()
      .data('settings', {fragment: true})
      .use(rehypeInferDescriptionMeta)
      .process(
        '<div><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></div>'
      )

    assert.deepEqual(file.data, {
      meta: {
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim…'
      }
    })
  })

  await t.test(
    'should support `inferDescriptionHast: true`',
    async function () {
      const file = await rehype()
        .data('settings', {fragment: true})
        .use(rehypeInferDescriptionMeta, {inferDescriptionHast: true})
        .process(
          '<div><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></div>'
        )

      assert.deepEqual(file.data, {
        meta: {
          description:
            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim…',
          descriptionHast: {
            type: 'root',
            children: [
              h('div', [
                h(
                  'p',
                  'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                ),
                h('p', 'Ut enim ad minim…')
              ])
            ],
            data: {quirksMode: false}
          }
        }
      })
    }
  )

  await t.test(
    'should support `mainSelector` to select the body (1)',
    async function () {
      const file = await rehype()
        .data('settings', {fragment: true})
        .use(rehypeInferDescriptionMeta, {mainSelector: 'article'})
        .process('<p>Lorem ipsum dolor sit amet.</p>')

      assert.deepEqual(file.data, {})
    }
  )

  await t.test(
    'should support `mainSelector` to select the body (2)',
    async function () {
      const file = await rehype()
        .data('settings', {fragment: true})
        .use(rehypeInferDescriptionMeta, {mainSelector: 'article'})
        .process(
          '<aside><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></aside><article><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></article>'
        )

      assert.deepEqual(file.data, {
        meta: {
          description:
            'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in…'
        }
      })
    }
  )

  await t.test(
    'should support `selector` to select the description',
    async function () {
      const file = await rehype()
        .data('settings', {fragment: true})
        .use(rehypeInferDescriptionMeta, {selector: '.byline'})
        .process(
          '<p class=byline>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'
        )

      assert.deepEqual(file.data, {
        meta: {
          description:
            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        }
      })
    }
  )

  await t.test(
    'should support `comment` to select the description',
    async function () {
      const file = await rehype()
        .data('settings', {fragment: true})
        .use(rehypeInferDescriptionMeta, {comment: 'summary'})
        .process(
          '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. <!-- summary --> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'
        )

      assert.deepEqual(file.data, {
        meta: {
          description:
            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        }
      })
    }
  )

  await t.test(
    'should support `selector` to select the description',
    async function () {
      const file = await rehype()
        .data('settings', {fragment: true})
        .use(rehypeInferDescriptionMeta, {ignoreSelector: '.ignore'})
        .process(
          '<p>Lorem ipsum dolor sit amet, <span class=ignore>consectetur adipisicing elit, </span>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>'
        )

      assert.deepEqual(file.data, {
        meta: {
          description:
            'Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        }
      })
    }
  )

  await t.test('should integrate w/ `rehype-meta`', async function () {
    const file = await rehype()
      .use(rehypeInferDescriptionMeta)
      .use(rehypeMeta)
      .process(
        '<h1>Hello, world</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'
      )

    assert.equal(
      String(file),
      '<html><head>\n<meta name="description" content="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad…">\n</head><body><h1>Hello, world</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></body></html>'
    )
  })
})
