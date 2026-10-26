# Remark language server wrapper

This is a small package to adjust some internal functionality of 
[remark-language-server](https://github.com/remarkjs/remark-language-server), 
specifically how certain configuration files apply to the language server.

## Installation

To install the package globally, run:

```bash
npm install -g @lhelwerd/remark-ls
```

To use it with `nvim-lspconfig` in Neovim 0.11+, use something like this:

```lua
vim.lsp.enable("remark_ls")
vim.lsp.config("remark_ls", {
  cmd = { 'remark-ls', '--stdio' },
  -- root_dir also needs a fallback to the buffer's own directory: with no
  -- root_dir at all, remark-language-server skips the buffer entirely rather
  -- than falling back to its own defaults, whenever no .remarkrc*/.git/
  -- package.json is found anywhere above the file's real location.
  root_dir = function(bufnr, on_dir)
    local markers = vim.lsp.config.remark_ls.root_markers
    local found = vim.fs.root(bufnr, markers)
    on_dir(found or vim.fs.dirname(vim.api.nvim_buf_get_name(bufnr)))
  end,
  -- Without any settings at all, Neovim's LSP client replies to the server's
  -- workspace/configuration request with null (no "remark" section was ever
  -- registered), which crashes remark-language-server (it assumes an object).
  -- An empty section is enough.
  settings = {
    remark = {}
  }
})
```

## Functionality

The wrapper achieves two goals:

- If a repository or working directory context has no Remark configuration, even 
  while walking up through parent directories up to the root, the packaged 
  `.remarkrc.mjs` is applied instead.
- If a Remark configuration is in use, but some development dependencies for 
  plugins are not installed, then remark-language-server is still able to run as 
  an LSP and be used for basic functionality such as formatting according to 
  conventions, instead of breaking.

This makes it possible to use the remark-language-server as a Markdown formatter 
without having to worry about setting up configuration or installing development 
dependencies in random working directories or repositories.

### Included plugins and configuration

The globally-applied fallback `.remarkrc.mjs` uses the following plugins and 
settings:

- `remark-gfm`: Use GitHub Flavored Markdown everywhere, enabling proper 
  formatting of strikethrough and plain links, among others
- `tighten`: Remove blank lines between individual list items
- `strip-link-titles`: Remove link titles from `[text](url "title")` if the 
  title is the same as the link text or URL
- List item settings: use `-` as bullet instead of `*`, only add one space after 
  the bullet or number (plus one for unordered lists or two for numbered lists), 
  and use increasing numbers instead of formatting numbered list with `1.` for 
  every item
- Paragraph formatting: Add a trailing space at the end of each line within 
  a textual block, so not for the final line, allowing some editors to rewrap 
  the text automatically during editing without relying on the LSP to reformat

## License

The remark language server wrapper is licensed under the [LICENSE](MIT License).

Disclaimer: Some of the code was written using AI, see [AGENTS.md](AGENTS.md) 
for details.
