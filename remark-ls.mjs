#!/usr/bin/env node
// Entry point for remark_ls's `cmd`: registers plugin-resolve-shim.mjs
// before anything else, then dynamically imports the actual wrapper
// logic (remark-ls-main.mjs), since node:module's `register()` only
// takes effect for imports that happen after it runs -- a static import
// of remark-ls-main.mjs here would already be resolved (along with its
// transitive unified-language-server/load-plugin imports) before this
// file's own top-level code ran.
import {register} from 'node:module'

register('./plugin-resolve-shim.mjs', import.meta.url)

await import('./remark-ls-main.mjs')
