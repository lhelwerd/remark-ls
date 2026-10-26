// Regression guard for plugin-resolve-shim.mjs's narrow goal: an
// unresolvable *bare* remark/rehype plugin specifier named by some other
// project's on-disk `.remarkrc*` should degrade to a no-op instead of
// making unified-engine fail the whole file, while a genuinely broken
// *relative* plugin specifier (a real local bug, not a missing
// dependency elsewhere) must still surface its error, and a resolvable
// relative plugin must still run normally. If this suite starts failing,
// it likely means `load-plugin` stopped resolving via `import-meta-resolve`
// the way the shim assumes (see plugin-resolve-shim.mjs); the shim would
// then silently stop intercepting, and remark_ls would go back to
// erroring on every file under an unrelated project's broken
// `.remarkrc*`, which is the pre-shim behavior this guards against.
import assert from 'node:assert/strict'
import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {register} from 'node:module'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {PassThrough} from 'node:stream'
import {test} from 'node:test'

register('../lib/plugin-resolve-shim.mjs', import.meta.url)

const {engine} = await import('unified-engine')
const {remark} = await import('remark')
const {VFile} = await import('vfile')

/**
 * Runs unified-engine once over a single in-memory markdown file, with
 * the given directory's `.remarkrc.json` discoverable via upward search.
 *
 * @param {string} dir
 * @returns {Promise<Array<string>>} vfile messages
 */
function runEngine(dir) {
  const files = [
    new VFile({path: path.join(dir, 'doc.md'), value: '# hi\n'})
  ]

  return new Promise((resolve, reject) => {
    engine(
      {
        cwd: dir,
        files,
        processor: remark,
        rcName: '.remarkrc',
        packageField: 'remarkConfig',
        quiet: false,
        streamError: new PassThrough(),
        streamOut: new PassThrough()
      },
      (error) => {
        if (error) reject(error)
        else resolve(files[0].messages.map((message) => message.message))
      }
    )
  })
}

/**
 * Creates a throwaway fixture directory under the OS temp dir, scoped to
 * the running test, and returns its path. Caller is responsible for
 * cleanup via `rm(dir, {recursive: true, force: true})`.
 *
 * @param {Record<string, string>} fileContents keyed by filename
 * @returns {Promise<string>}
 */
async function makeFixture(fileContents) {
  const dir = await mkdtemp(path.join(tmpdir(), 'remark-shim-test-'))

  await Promise.all(
    Object.entries(fileContents).map(([name, content]) =>
      writeFile(path.join(dir, name), content)
    )
  )

  return dir
}

test('squelches an unresolvable bare remark/rehype plugin name', async () => {
  const dir = await makeFixture({
    '.remarkrc.json': JSON.stringify({
      plugins: ['remark-lint-nonexistent-plugin-for-testing']
    })
  })

  const originalError = console.error
  const logged = []
  console.error = (message) => logged.push(message)

  try {
    assert.deepEqual(await runEngine(dir), [])
    assert.ok(
      logged.some((message) =>
        message.includes('remark-lint-nonexistent-plugin-for-testing')
      ),
      'expected a squelch message logged via console.error'
    )
  } finally {
    console.error = originalError
    await rm(dir, {recursive: true, force: true})
  }
})

test('still errors on an unresolvable relative plugin path', async () => {
  const dir = await makeFixture({
    '.remarkrc.json': JSON.stringify({plugins: ['./does-not-exist.mjs']})
  })

  try {
    assert.deepEqual(await runEngine(dir), ['Cannot process file'])
  } finally {
    await rm(dir, {recursive: true, force: true})
  }
})

test('still loads a resolvable relative plugin normally', async () => {
  const dir = await makeFixture({
    'good-plugin.mjs':
      'export default function () { return () => {} }\n',
    '.remarkrc.json': JSON.stringify({plugins: ['./good-plugin.mjs']})
  })

  try {
    assert.deepEqual(await runEngine(dir), [])
  } finally {
    await rm(dir, {recursive: true, force: true})
  }
})
