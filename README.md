# mprettier


Minimal prettier

- Always invoked manually, no format-on-save feature, no linter integration.
- No overhead on Atom startup since this package is activated when you invoked `mprettier:format` command.
- You need configure prettier options directly in your `config.cson`, no fancy setting UI

If this package is not for you, use [prettier-atom](https://atom.io/packages/prettier-atom) which is basically **better** than this package.

![img](https://raw.githubusercontent.com/t9md/t9md/766b1a0f7c6d3bad8b03b8f49eb0d1080d466da4/img/mprettier.jpg)

## How to use?

Invoke `mprettier:format`(`ctrl-alt-f`) on text editor.

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

- [ ] determine accurate parser to user from grammar
- [ ] ignore file, scope?
- [x] detect user's prettier config by `prettier.resolveConfig`
- [ ] make prettier path configurable? flexibility which global/local prettier to use
- [ ] support embedded code block

## Thanks

Thanks for creating super great library and tools, this package greatly owning to following projects.

- [prettier](https://github.com/prettier/prettier)
- [prettier-atom](https://atom.io/packages/prettier-atom)
