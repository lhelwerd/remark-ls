#!/usr/bin/env node
// A thin wrapper around remark-language-server that bakes in this
// directory's shared Markdown conventions as the processor's *baseline*
// plugins, instead of relying solely on remark-language-server finding a
// `.remarkrc.mjs` by walking up from the edited file's own path.
//
// unified-engine (which remark-language-server uses) still merges
// explicitly given plugins/settings with anything it finds on disk, but
// unified-language-server only ever forwards "plugins" from its own
// top-level options into unified-engine, never "settings" (see its
// `EngineFields` type), so the "settings" exported by .remarkrc.mjs
// (bullet, listItemIndent, etc) has to be applied via a plugin instead
// (apply-settings.mjs) to take effect here regardless of file location.
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
