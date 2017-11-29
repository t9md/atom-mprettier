# 0.5.0: WIP
- New, Experimental: `toggle-disable-file` to temporally disable/enable current editor's filePath on `formatOnSave`.
- Breaking: Rethink configuration parameters name, how to be organized
  - Now manual format is always executed as long as prettier found, so exclusion option is for `formatOnSave` only.
  - Many configuration options are renamed, and move to specific category for easy to understand it's intent.
    - old `disabledParsersOnFormatOnSave` is now `formatOnSave.disabledParsers`
    - `usePrettierInXXX` params are moved under `prettierToUseInOrder` object. E.g. `prettierToUseInOrder.inCurrentFileDirectory`
  - No auto migration sorry! If you have customized some configuration, do following steps so that stale configuration no appear in setting-view.
    - Remove it manually from your `config.cson` except `prettierOptions` config.
    - Then reconfigure it from setting-view.

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
