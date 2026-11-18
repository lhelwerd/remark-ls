// A custom mdast-util-to-markdown handler for "text" nodes adding a trailing
// space before each soft line break. Sets a hard-wrapped Markdown convention
// (wrap at 80 columns, trailing space marking a continued paragraph/list item).
// Other conventions and plugins consider the line ending to be insignificant
// and discardable, but the spaces help editors with line wrapping. This only
// touches the plain line endings in a text node's value (soft breaks), other
// node types (hard breaks with `\`, code, headings, etc.) are left alone.
// Used by ../.remarkrc.mjs.
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
