// A unified/remark plugin that lints fenced `json` code blocks. Every such
// block must be valid JSON. If its top-level object has a `$schema` string
// that is a file path (relative to the Markdown file, or absolute), the
// block is also validated against that JSON Schema (draft 2020-12). The
// `$schema` key itself is not validated, so schemas need not allow it. URL
// references are skipped because no network access is attempted. Problems
// are reported as vfile messages, which the language server shows as
// diagnostics. Used by ../.remarkrc.mjs.
import {readFileSync} from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import {visit} from 'unist-util-visit'

const URL_SCHEME = /^[a-z][a-z0-9+.-]*:/i

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export default function validateJsonBlocks() {
  return (tree, file) => {
    visit(tree, 'code', (node) => {
      if (node.lang !== 'json') {
        return
      }

      let data
      try {
        data = JSON.parse(node.value)
      } catch (error) {
        file.message(`Invalid JSON: ${error.message}`, node,
          'validate-json-blocks:syntax')
        return
      }

      if (!isObject(data) || typeof data.$schema !== 'string' ||
            URL_SCHEME.test(data.$schema)) {
        return
      }

      const {$schema: schemaPath, ...instance} = data
      const resolved = path.resolve(file.dirname ?? '.', schemaPath)
      let validate
      try {
        const schema = JSON.parse(readFileSync(resolved, 'utf8'))
        const ajv = new Ajv2020({allErrors: true})
        addFormats(ajv)
        validate = ajv.compile(schema)
      } catch (error) {
        file.message(`Cannot use schema ${schemaPath}: ${error.message}`,
          node, 'validate-json-blocks:schema')
        return
      }

      if (!validate(instance)) {
        for (const error of validate.errors) {
          file.message(`${error.instancePath || '/'} ${error.message}`, node,
            'validate-json-blocks:validation')
        }
      }
    })
  }
}
