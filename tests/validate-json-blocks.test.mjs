import assert from 'node:assert/strict'
import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {after, before, test} from 'node:test'
import {remark} from 'remark'
import {VFile} from 'vfile'
import validateJsonBlocks from '../plugins/validate-json-blocks.mjs'

const SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    host: {type: 'string', format: 'hostname'}
  },
  required: ['host'],
  additionalProperties: false
}

let dir

before(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'validate-json-blocks-'))
  await writeFile(path.join(dir, 'schema.json'), JSON.stringify(SCHEMA))
  await writeFile(path.join(dir, 'broken.json'), '{')
})

after(async () => {
  await rm(dir, {recursive: true, force: true})
})

async function lint(block, lang = 'json') {
  const value = `# Title\n\n\`\`\`${lang}\n${block}\n\`\`\`\n`
  const file = new VFile({path: path.join(dir, 'doc.md'), value})
  await remark().use(validateJsonBlocks).process(file)
  return file.messages.map((message) =>
    `${message.source}:${message.ruleId}: ${message.reason}`)
}

test('valid block against a relative schema has no messages', async () => {
  const block = '{"$schema": "schema.json", "host": "github.com"}'
  assert.deepEqual(await lint(block), [])
})

test('schema violations are reported per error', async () => {
  const block = '{"$schema": "schema.json", "host": "not a host", "x": 1}'
  const messages = await lint(block)
  assert.equal(messages.length, 2)
  assert.ok(messages.every((message) => message.startsWith(
    'validate-json-blocks:validation: ')))
})

test('malformed JSON is reported as a syntax problem', async () => {
  const messages = await lint('{"a": }')
  assert.equal(messages.length, 1)
  assert.match(messages[0], /^validate-json-blocks:syntax: Invalid JSON/)
})

test('missing and unusable schemas are reported', async () => {
  const missing = await lint('{"$schema": "nope.json"}')
  assert.match(missing[0], /^validate-json-blocks:schema: Cannot use schema/)
  const broken = await lint('{"$schema": "broken.json"}')
  assert.match(broken[0], /^validate-json-blocks:schema: Cannot use schema/)
})

test('URL schemas, no schema and other languages are skipped', async () => {
  assert.deepEqual(
    await lint('{"$schema": "https://example.com/s.json"}'), [])
  assert.deepEqual(await lint('{"host": 1}'), [])
  assert.deepEqual(await lint('[1, 2]'), [])
  assert.deepEqual(await lint('not json', 'text'), [])
})
