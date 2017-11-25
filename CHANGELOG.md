# 0.4.0:
- New: now can disable specific parser by configuration.
  - `disabledParsersOnFormatOnSave` is checked on `formatOnSave` case only.
  - `disabledParsers` is checked in both manual and `formatOnSave` case.

# 0.3.0:
- New: `formatOnSave`, works on **active** text editor only.

# 0.2.0:
- New: `scopesForParser` config, which allows user to specify which parser to use by scopes. #1
  - Now language grammar scopes information is defined for following parser.
  - `javascript`,`typescript`,`postcss`,`json`,`graphql`,`markdown`,

# 0.1.2:
- Rename config param
  - old: `usePrettierInCurrentFileDir`
  - new: `usePrettierInCurrentFileDirectory`

# 0.1.1:
- Doc: Fix image caption in README.md

# 0.1.0:
- New: Initial version
