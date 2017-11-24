# mprettier

Minimal prettier, why?

- Always invoked manually, no format-on-save feature, no linter integration.
- No overhead on Atom startup since this package is activated when you invoked `mprettier:format` command.
- You need configure prettier options directly in your `config.cson`, no fancy setting UI

If this package is not for you, use [prettier-atom](https://atom.io/packages/prettier-atom) which is basically BETTER than this package.

## How to use?

Invoke `mprettier:format`(`ctrl-alt-f`) on text editor.

## Config example

`config.cson`

```coffeescript
  mprettier:
    prettierOptions:
      bracketSpacing: false
      jsxBracketSameLine: true
      printWidth: 120
      semi: false
      trailingComma: "es5"
```

## TODO

- [ ] determine accurate parser to user from grammar
- [ ] ignore file, scope?
- [ ] detect user config by `prettier.resolveConfig`
- [ ] make prettier path configurable? flexibility which global/local prettier to use
# atom-mprettier
