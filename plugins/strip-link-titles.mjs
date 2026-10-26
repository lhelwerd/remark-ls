// A unified/remark plugin that drops a link's "title" (the optional
// `"..."` after the URL, e.g. from an HTML <a title="...">) whenever it is
// redundant: exactly the same as the link's own text or as its URL. Such
// titles add nothing readable (an unselectable tooltip restating what is
// already on the line) and commonly come along for the ride when pandoc
// converts HTML links (see autoload/clipboard.vim). A genuinely different
// title (a real tooltip/description) is left untouched. Used by
// ../.remarkrc.mjs.
function toText(node) {
  if (typeof node.value === 'string') {
    return node.value
  }
  if (node.children) {
    return node.children.map(toText).join('')
  }
  return ''
}

export default function stripRedundantLinkTitles() {
  return (tree) => {
    const visit = (node) => {
      if (node.type === 'link' && node.title &&
            (node.title === toText(node) || node.title === node.url)) {
        node.title = null
      }
      if (node.children) {
        node.children.forEach(visit)
      }
    }
    visit(tree)
  }
}
