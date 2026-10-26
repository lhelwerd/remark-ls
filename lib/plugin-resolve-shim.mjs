// Node module customization hook (see node:module's `register()`) that
// makes `load-plugin` (used internally by `unified-engine` to resolve
// remark/rehype plugin specifiers named in a discovered `.remarkrc*` or
// package.json "remarkConfig") treat an unresolvable *bare* remark/rehype
// plugin specifier as a no-op plugin instead of throwing, so one unrelated
// project's broken/uninstalled lint-plugin list can't take down remark_ls
// for every markdown file it then tries to process. Relative/absolute
// plugin specifiers (e.g. "./tighten.mjs") are left untouched, so a
// genuinely broken *local* plugin still surfaces its real error.
//
// This works by intercepting load-plugin's own
// `import {resolve} from 'import-meta-resolve'` (a real ESM import Node's
// loader hooks do see) and substituting a small wrapper module generated
// at runtime, since `import-meta-resolve` itself reimplements Node's
// resolution algorithm in plain JS (fs calls) rather than going through
// Node's loader pipeline, so a hook can't catch its internal failures
// directly. If `load-plugin` ever stops importing `import-meta-resolve`
// this way, this shim silently becomes a no-op and plugin-resolution
// failures simply error again as before.
//
// Only squelches the *first* resolution attempt for a given specifier;
// load-plugin can retry a bare specifier against a second (global
// node_modules) root in some cases, which this shim would short-circuit
// before that retry happens. In remark_ls's actual usage there is always
// a single explicit root, so this doesn't matter in practice.
//
// Logs each squelch via `console.error` (stderr) so it's still visible
// (e.g. in Neovim's `:lua vim.print(vim.lsp.log.get_filename())` log)
// instead of silently vanishing, even though it no longer fails the file.

const TARGET_SPECIFIER = 'import-meta-resolve'
const NOOP_PROTOCOL = 'remark-noop:'
// Matches bare (non-relative, non-absolute) remark/rehype plugin names,
// e.g. "remark-lint-final-newline" or "@scope/remark-foo", the only
// specifiers we consider safe to silently no-op on a resolution failure.
const PLUGIN_NAME_RE = /^(@[^/]+\/)?(remark|rehype)-[\w.-]+$/

// Tagged template literal that generates a JS module source string, using
// cooked (not raw) string parts so a `\${...}`/`` \` `` escape inside the
// template literally survives into the generated source as a *real*
// nested template-literal expression for the inner module to evaluate at
// runtime, rather than being evaluated eagerly in this (outer) scope.
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
