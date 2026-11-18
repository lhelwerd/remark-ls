#!/usr/bin/env node
// Entry point for remark_ls's `cmd`: registers lib/plugin-resolve-shim.mjs
// then dynamically imports the actual wrapper logic (lib/index.mjs).
// node:module's `register()` takes effect for imports that happen after it runs 
// so a static import of lib/index.mjs here would already be resolved (along
// with its transitive unified-language-server/load-plugin imports) before this
// file's own top-level code ran.
import {register} from 'node:module'

register('../lib/plugin-resolve-shim.mjs', import.meta.url)

await import('../lib/index.mjs')
