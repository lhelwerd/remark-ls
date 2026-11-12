// remark-language-server (and remark-cli) configuration: single space after
// list markers (bullet/numbered), tight lists, incrementing ordered-list
// numbers, trailing-space soft breaks, dropping redundant link titles, and
// diagnostics for invalid or schema-violating `json` code blocks. See
// tighten.mjs for why tight lists need a small plugin instead of a setting,
// trailing-space.mjs for why that trailing space needs a stringify handler
// instead of a setting, strip-link-titles.mjs for which link titles count as
// "redundant", and validate-json-blocks.mjs for how code blocks are checked.
//
// bin/index.mjs (via lib/index.mjs) imports this file's "plugins" and
// "settings" as remark_ls's own always-applied baseline (see there for why
// that wrapper exists instead of relying solely on remark-language-server's
// own upward `.remarkrc*` search).
import remarkGfm from 'remark-gfm'
import stripRedundantLinkTitles from './plugins/strip-link-titles.mjs'
import tighten from './plugins/tighten.mjs'
import trailingSpaceText from './plugins/trailing-space.mjs'
import validateJsonBlocks from './plugins/validate-json-blocks.mjs'

export default {
  // remark-gfm adds GitHub-flavored Markdown support (strikethrough,
  // tables, task lists, autolinks) to both parsing and stringifying.
  plugins: [remarkGfm, tighten, stripRedundantLinkTitles, validateJsonBlocks],
  settings: {
    bullet: '-',
    listItemIndent: 'one',
    incrementListMarker: true,
    handlers: {
      text: trailingSpaceText
    }
  }
}


