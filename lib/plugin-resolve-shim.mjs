// Node module customization hook (see node:module's `register()`) that
// makes `load-plugin` (used internally by `unified-engine` to resolve
// remark/rehype plugin specifiers named in a discovered config file)
// treat an unresolvable *bare* remark/rehype plugin specifier as a no-op plugin
// instead of throwing, so any broken/uninstalled plugins do not shut down
// remark_ls with no processing at all for Markdown files. Relative/absolute
// plugin specifiers (e.g. "./tighten.mjs") are untouched and may still error.
//
// This works by registering an import hook to intercept load-plugin's own
// `import {resolve} from 'import-meta-resolve'` (a real ESM import Node's
// loader hooks do see) and substituting a small wrapper module generated
// at runtime to be able to catch internal resolver failures directly instead
// of with a normal hook which does not have this functionality.
// NB: If `load-plugin` ever stops importing `import-meta-resolve`
// this way, this shim silently becomes a no-op and plugin-resolution
// failures simply error again as before.
//
// Only squelches the *first* resolution attempt for a given specifier;
// load-plugin can retry a bare specifier against a second (global
// node_modules) root in some cases, which this shim would short-circuit
// before that retry happens. In remark_ls's actual usage there is always
// a single explicit root, so this doesn't matter in practice.
//
// Squelched imports are logged to stderr so it's traceable in most contexts
// (e.g. in Neovim's `:lua vim.print(vim.lsp.log.get_filename())` log)
// instead of silently vanishing.

const TARGET_SPECIFIER = 'import-meta-resolve'
const NOOP_PROTOCOL = 'remark-noop:'
// Matches bare (non-relative, non-absolute) remark/rehype plugin names,
// e.g. "remark-lint-final-newline" or "@scope/remark-foo", the only
// specifiers we consider safe to silently no-op on a resolution failure.
// Deep imports of package subpaths (e.g. "remark-lint-final-newline/lib/rules")
// are also considered a bare plugin name, so slashes are included, as per
// https://nodejs.org/api/esm.html#terminology
const PLUGIN_NAME_RE = /^(@[^/]+\/)?(remark|rehype)-[\w./-]+$/

// Tagged template literal that generates a JS module source string, using
// cooked (not raw) string parts so a `\${...}`/`` \` `` escape inside the
// template literally survives into the generated source as a *real*
// nested template-literal expression for the inner module to evaluate at
// runtime, rather than being evaluated eagerly in the outer scope.
const js = (strings, ...values) =>
  strings.reduce(
    (source, part, index) =>
      source + part + (index < values.length ? String(values[index]) : ''),
    ''
  )

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(NOOP_PROTOCOL)) {
    return {url: specifier, shortCircuit: true}
  }

  if (specifier === TARGET_SPECIFIER) {
    const real = await nextResolve(specifier, context)
    return {url: `${NOOP_PROTOCOL}wrap:${real.url}`, shortCircuit: true}
  }

  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  if (url.startsWith(`${NOOP_PROTOCOL}wrap:`)) {
    const realUrl = url.slice(`${NOOP_PROTOCOL}wrap:`.length)
    const source = js`
import {resolve as realResolve} from ${JSON.stringify(realUrl)}
const PLUGIN_NAME_RE = ${PLUGIN_NAME_RE.toString()}
const NOOP_PROTOCOL = ${JSON.stringify(NOOP_PROTOCOL)}
export async function resolve(specifier, base, defaultResolve) {
  try {
    return await realResolve(specifier, base, defaultResolve)
  } catch (error) {
    if (PLUGIN_NAME_RE.test(specifier)) {
      console.error(
        \`[remark-plugin-resolve-shim] squelching unresolvable plugin '\${specifier}': \${error.message}\`
      )
      return \`\${NOOP_PROTOCOL}plugin:\${encodeURIComponent(specifier)}\`
    }

    throw error
  }
}
`
    return {format: 'module', shortCircuit: true, source}
  }

  if (url.startsWith(`${NOOP_PROTOCOL}plugin:`)) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default function remarkNoopPlugin() {}\n'
    }
  }

  return nextLoad(url, context)
}
