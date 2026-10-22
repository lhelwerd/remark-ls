// remark-language-server (and remark-cli) configuration: single space after
// list markers (bullet/numbered), tight lists, incrementing ordered-list
// numbers, and trailing-space soft breaks, matching ~/.copilot/instructions'
// Markdown conventions. See autoload/clipboard.vim for why this fixes up
// pandoc's HTML-to-Markdown output specifically, tighten.mjs for why tight
// lists need a small plugin instead of a setting, and trailing-space.mjs for
// why that trailing space needs a stringify handler instead of a setting.
//
// Discovered via nvim-lspconfig's remark_ls `root_markers`, which look for
// this file (or a sibling .remarkrc*) starting at the edited file's own
// directory and walking upward; symlink it to someplace that is an ancestor
// of every Markdown file you want formatted (e.g. "ln -s
// ~/vim/nvim/remark/.remarkrc.mjs ~/.remarkrc.mjs"), see README.md.
import tighten from './tighten.mjs'
import trailingSpaceText from './trailing-space.mjs'

export default {
  plugins: [tighten],
  settings: {
    bullet: '-',
    listItemIndent: 'one',
    incrementListMarker: true,
    handlers: {
      text: trailingSpaceText
    }
  }
}

