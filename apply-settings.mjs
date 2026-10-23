// A unified/remark plugin factory that applies fixed stringify/parse
// settings (e.g. "bullet", "listItemIndent") unconditionally, the same way
// a `.remarkrc.mjs`'s own "settings" field would. remark-language-server's
// `settings` configuration key is per-document editor LSP settings
// (requireConfig/ignorePath only; see unified-language-server's
// `UnifiedLanguageServerSettings`), *not* the processor settings a
// `.remarkrc.mjs` exports, and unified-language-server never forwards a
// config file's "settings" field into the processor on its own: it only
// forwards "plugins" (see remark-ls.mjs for why that distinction matters).
// Wrapping the desired settings as a plugin is the supported way for a
// plugin list to still apply them, since `remark-stringify` reads
// `this.data('settings')` and merges it with explicit stringify options.
// Used by remark-ls.mjs.
export default function applySettings(settings) {
  return function () {
    this.data('settings', {...this.data('settings'), ...settings})
  }
}
