// A unified/remark plugin factory that applies fixed stringify/parse
// settings (e.g. "bullet", "listItemIndent") unconditionally, the same way
// a remark config file's "settings" field would. remark-language-server's
// `settings` configuration key is per-document limited editor LSP settings,
// not the processor settings a config file exports, requiring us to forward
// the settings ourselves. Wrapping the desired settings as a plugin is the
// supported way to apply them also used by other plugins.
export default function applySettings(settings) {
  return function () {
    this.data('settings', {...this.data('settings'), ...settings})
  }
}
