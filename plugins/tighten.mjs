// A unified/remark plugin that forces every list in the document to render
// "tight" (no blank line between items), regardless of whether the source
// markdown had blank lines between list-item blocks. looseness is read from
// each list's (and list item's) own "spread" property, set while parsing from
// whether the source had blank lines, so it is cleared for these node types.
// Used by ../.remarkrc.mjs.
export default function tighten() {
  return (tree) => {
    const visit = (node) => {
      if (node.type === 'list' || node.type === 'listItem') {
        node.spread = false
      }
      if (node.children) {
        node.children.forEach(visit)
      }
    }
    visit(tree)
  }
}
