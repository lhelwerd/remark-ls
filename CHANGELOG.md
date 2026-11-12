# Changelog

## [0.0.1](https://github.com/lhelwerd/remark-ls/releases/tag/v0.0.1) (2026-10-26)

### Features

- Remark language server wrapper that applies a packaged `.remarkrc.mjs` when no 
  Remark configuration is found, with Markdown formatting conventions: `-` 
  bullets, single space after list markers, tight lists, incrementing numbered 
  lists, and trailing-space soft breaks.
- `tighten` and `strip-link-titles` plugins, and `remark-gfm` support.
- Resolve shim that ignores unresolvable plugins named by repository-local 
  configuration instead of failing, with a regression test.
