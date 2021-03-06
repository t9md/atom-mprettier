# mprettier

:warning: **Alpha status**: Might introduce breaking changes until I set this stable(or remove this warning).

**M**inimalistic [prettier](https://github.com/prettier/prettier) runner for AtomEditor

- Small overhead on Atom startup with less feature(E.g. no eslint integration for now)
- [prettierOptions](https://prettier.io/docs/en/options.html) are directly passed to prettier, you need configure it directly in your `config.cson`, mprettier does nothing for prettierOptions.
- Trying to being as explicit as possible in behavior/code/configuration parameters.

If this package is not for you, use [prettier-atom](https://atom.io/packages/prettier-atom) which is basically **better** than this package.

![img](https://raw.githubusercontent.com/t9md/t9md/321b0393309a3cfc653e3ee9627c162294b8e5cd/img/mprettier.png)

## How to use?

- Invoke `mprettier:format`(`ctrl-alt-f`) on text editor.
- If you have trouble, execute `mprettier:clip-debug-info`.
  - This command clip debug info into clipboard
  - Paste it to buffer then observe it by yourself before opening issue.

## Config example

- For [prettierOptions](https://prettier.io/docs/en/options.html), you need to edit `config.cson` manually.

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

- [x] determine parser to use from language grammar
- [ ] ignore file, scope?
- [x] ignore parser formatOnSave only and both formatOnSave + manual execution respectively
- [x] detect user's prettier config by `prettier.resolveConfig`
- [x] make prettier path configurable? flexibility which global/local prettier to use
- [ ] support embedded code block
- [x] format on save

## Thanks

Thanks for creating super great library and tools, this package is greatly owning to following projects.

- [prettier](https://github.com/prettier/prettier)
- [prettier-atom](https://atom.io/packages/prettier-atom)
