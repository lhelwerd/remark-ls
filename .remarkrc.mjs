// remark-language-server (and remark-cli) configuration: single space after
// list markers (bullet/numbered), tight lists, incrementing ordered-list
// numbers, trailing-space soft breaks, and dropping redundant link titles,
// matching ~/.copilot/instructions' Markdown conventions. See
// autoload/clipboard.vim for why this fixes up pandoc's HTML-to-Markdown
// output specifically, tighten.mjs for why tight lists need a small plugin
// instead of a setting, trailing-space.mjs for why that trailing space
// needs a stringify handler instead of a setting, and
// strip-link-titles.mjs for which link titles count as "redundant".
//
// remark-ls.mjs imports this file's "plugins" and "settings" as remark_ls's
// own always-applied baseline (see there for why that wrapper exists
// instead of relying solely on remark-language-server's own upward
// `.remarkrc*` search).
import remarkGfm from 'remark-gfm'
import stripRedundantLinkTitles from './strip-link-titles.mjs'
import tighten from './tighten.mjs'
import trailingSpaceText from './trailing-space.mjs'

export default {
  // remark-gfm adds GitHub-flavored Markdown support (strikethrough,
  // tables, task lists, autolinks) to both parsing and stringifying.
  plugins: [remarkGfm, tighten, stripRedundantLinkTitles],
  settings: {
    bullet: '-',
    listItemIndent: 'one',
    incrementListMarker: true,
    handlers: {
      text: trailingSpaceText
    }
  }
}


