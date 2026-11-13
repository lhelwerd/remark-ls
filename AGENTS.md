# Using agentic and generative AI in the remark language server wrapper

## Contributions

This is an open-source project. Contributions must be licensed properly:

- Code contributions must be licensed under the MIT License.
- If agentic AI uses output based on pre-existing content, avoid inclusion of 
  code and documentation that is not compatible with these respective licenses.

## Code locations

- `bin` contains entrypoints that should be directly executable from command 
  line based on names registered in `package.json`'s `bin` object.
- `lib` contains modules that override functionality from remark-language-server 
  or its dependencies.
- `plugins` contains custom remark plugins to adjust how Markdown files are 
  formatted.
- `tests` contains test files (named `*.test.mjs`) for any modules from other 
  directories.
- `.remarkrc.mjs` contains a global configuration for Remark.

## Testing

- Use `npm test` to run the tests from the `tests` directory.
- Use `npm coverage` to obtain TAP output and JUnit XML and coverage LCOV files.

## Code style

- Use template literals instead of concatenation, even for nested template 
  literals and through use of tagged template literals to indicate languages.
- Use logging when performing an action otherwise transparent to the user to 
  allow LSP clients to redirect logs to files for debugging purposes.

## Commits and releases

- Write commit messages as [Conventional Commits](https://www.conventionalcommits.org/): 
  `fix:` (patch release), `feat:` (minor), and `feat!:` or a `BREAKING CHANGE:` 
  footer (major). Use `chore(docs):`, `chore(test):` and similar scoped 
  `chore:` types for changes that must not trigger a release.
- Releases are computed from these messages by CI, so keep each commit to one 
  logical change with an accurate type.
- Work on a feature branch and open a pull request instead of committing to 
  `main`.
