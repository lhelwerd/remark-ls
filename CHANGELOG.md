# Changelog

## [0.1.1](https://github.com/lhelwerd/remark-ls/compare/v0.1.0...v0.1.1) (2026-11-12)

### Bug Fixes

* Use normalized repository field in package.json ([f4bd6b0](https://github.com/lhelwerd/remark-ls/commit/f4bd6b075c1ad331dbc5674537d05b3091f656b2))

## [0.1.0](https://github.com/lhelwerd/remark-ls/compare/v0.0.1...v0.1.0) (2026-11-12)

### Features

* Add plugin to validate JSON blocks in markdown ([cdb1c39](https://github.com/lhelwerd/remark-ls/commit/cdb1c395f37fdb52f496f997d560948fba417c5a))

## [0.0.1](https://github.com/lhelwerd/remark-ls/releases/tag/v0.0.1) (2026-10-26)

### Features

- Remark language server wrapper that applies a packaged `.remarkrc.mjs` when no 
  Remark configuration is found, with Markdown formatting conventions: `-` 
  bullets, single space after list markers, tight lists, incrementing numbered 
  lists, and trailing-space soft breaks.
- `tighten` and `strip-link-titles` plugins, and `remark-gfm` support.
- Resolve shim that ignores unresolvable plugins named by repository-local 
  configuration instead of failing, with a regression test.
