// Wrapper logic for the remark-language-server.
// This is loaded dynamically by bin/index.mjs after it registers
// plugin-resolve-shim.mjs, allowing node:module's `register()` to affect
// imports that happen *after* it is called in that entry point.
// Considering that static imports are all resolved before a file's
// top-level code executes, we must delay importing unified-language-server
// (which transitively imports load-plugin/import-meta-resolve) separately.
//
// This language server comes with a default configuration in the package
// directory, with Markdown conventions that are shared as the processor's
// baseline plugins. The stock instead remark-language-server only works if
// it finds `.remarkrc.mjs` by walking up from the edited file's own path.
// This implementation uses the default configuration if none was found.
//
// Some settings of the default configuration are applied even when there
// is an override configuration. For internal reasons in unified-engine of
// the stock remark-language-server mean these settings have to be applied
// via a plugin (apply-settings.mjs) to merge with override configuration.
// 
// This relies on the entry point registering plugin-resolve-shim.mjs, so
// that an unrelated project's `.remarkrc*` naming a remark/rehype lint
// plugin that isn't resolvable does not crash the server for every markdown
// file, but ignores it instead.
import process from 'node:process'
import {remark} from 'remark'
import {createUnifiedLanguageServer} from 'unified-language-server'
import config from '../.remarkrc.mjs'
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
