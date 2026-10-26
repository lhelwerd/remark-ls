// A custom mdast-util-to-markdown handler for "text" nodes that restores a
// single trailing space before each soft line break, matching the
// hard-wrapped Markdown convention (wrap at 80 columns, trailing space
// marking a continued paragraph/list item). CommonMark treats trailing
// spaces before a line ending as insignificant, so remark-parse always
// discards them; stringify's default text handler therefore never puts
// them back. This only touches the plain line endings already encoded in
// a text node's value (soft breaks); explicit hard breaks are a separate
// mdast node type, so they and everything else (code, headings, etc.) are
// left alone. Used by ../.remarkrc.mjs.
export default function trailingSpaceText(node, parent, state, info) {
  const siblings = parent ? parent.children : []
  const index = siblings.indexOf(node)
  const safe = state.safe(node.value, {
    ...info,
    afterNode: siblings[index + 1],
    beforeNode: siblings[index - 1]
  })
  return safe.replace(/\n/g, ' \n')
}
