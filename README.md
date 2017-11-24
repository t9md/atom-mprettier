# mprettier

**M**inimum / **M**inimalistic / **M**anual prettier for AtomEditor

- Always invoked manually, no format-on-save feature, no linter integration.
- No overhead on Atom startup since this package is activated when you invoked `mprettier:format` command.
- You need configure prettier options directly in your `config.cson`, no fancy setting UI

If this package is not for you, use [prettier-atom](https://atom.io/packages/prettier-atom) which is basically **better** than this package.

![img](https://raw.githubusercontent.com/t9md/t9md/c32e34f30998f8840671d1a7ad43074136ba4b02/img/mprettier.png)

## How to use?

- Invoke `mprettier:format`(`ctrl-alt-f`) on text editor.
- If you have trouble execute `mprettier:clip-debug-info`.
  - This command clipt debug info into clipboard
  - Paste it to buffer then observe it by yourself before opening issue.

## Config example

[available options](https://prettier.io/docs/en/options.html)

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

- [x] determine accurate parser to user from grammar
- [ ] ignore file, scope?
- [x] detect user's prettier config by `prettier.resolveConfig`
- [x] make prettier path configurable? flexibility which global/local prettier to use
- [ ] support embedded code block
- [ ] format on save **once manually invoked and pkg activated** ?

## Thanks

Thanks for creating super great library and tools, this package greatly owning to following projects.

- [prettier](https://github.com/prettier/prettier)
- [prettier-atom](https://atom.io/packages/prettier-atom)
