// The actual remark-language-server wrapper logic, loaded dynamically by
// remark-ls.mjs (after it registers plugin-resolve-shim.mjs) rather than
// being the entry point itself: `node:module`'s `register()` only affects
// imports that happen *after* it runs, but a file's own static imports
// are all resolved before its top-level code executes, so registering a
// loader hook and statically importing unified-language-server (which
// transitively imports load-plugin/import-meta-resolve) in the same file
// would be too late for the hook to apply.
//
// Bakes in this directory's shared Markdown conventions as the
// processor's *baseline* plugins, instead of relying solely on
// remark-language-server finding a `.remarkrc.mjs` by walking up from the
// edited file's own path.
//
// unified-engine (which remark-language-server uses) still merges
// explicitly given plugins/settings with anything it finds on disk, but
// unified-language-server only ever forwards "plugins" from its own
// top-level options into unified-engine, never "settings" (see its
// `EngineFields` type), so the "settings" exported by .remarkrc.mjs
// (bullet, listItemIndent, etc) has to be applied via a plugin instead
// (apply-settings.mjs) to take effect here regardless of file location.
// `rcName`/`packageField` let it also merge a project's own on-disk
// `.remarkrc*`/package.json "remarkConfig" (e.g. per-repo overrides).
// This relies on remark-ls.mjs having already registered
// plugin-resolve-shim.mjs, so that an unrelated project's `.remarkrc*`
// naming a remark/rehype lint plugin that isn't installed anywhere
// resolvable (e.g. one only installed in a separate pre-commit
// environment) degrades to a no-op instead of crashing the server for
// every markdown file it then tries to process -- see
// plugin-resolve-shim.mjs for how, and nvim/remark/tests for the
// regression guard on that behavior.
// Run `npm install` in this directory once to fetch "remark" and
// "unified-language-server" before using this as remark_ls's `cmd`.
import process from 'node:process'
import {remark} from 'remark'
import {createUnifiedLanguageServer} from 'unified-language-server'
import config from './.remarkrc.mjs'
import applySettings from './apply-settings.mjs'

process.title = 'remark-language-server'

createUnifiedLanguageServer({
  configurationSection: 'remark',
  defaultProcessor: remark,
  ignoreName: '.remarkignore',
  packageField: 'remarkConfig',
  pluginPrefix: 'remark',
  processorName: 'remark',
  processorSpecifier: 'remark',
  rcName: '.remarkrc',
  plugins: [...config.plugins, applySettings(config.settings)]
})
