// A unified/remark plugin that forces every list in the document to render
// "tight" (no blank line between items), regardless of whether the source
// markdown had blank lines between <li>/list-item blocks. remark/mdast has
// no built-in stringifier option for this: looseness is read from each
// list's (and list item's) own "spread" property, set while parsing from
// whether the source had blank lines, so it has to be cleared here before
// stringifying. Used by ../.remarkrc.mjs.
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
