const prettier = require("prettier")

const parserNameByScopeName = {
  "source.json": "json",
  "text.md": "markdown",
  "source.gfm": "markdown",
  "source.ts": "typescript",
}

function getConfig(param) {
  return atom.config.get(`mprettier.${param}`)
}

function getPrettierOptions(editor) {
  const filePath = editor.getPath()
  if (filePath) {
    const options = prettier.resolveConfig.sync(filePath)
    if (options) return options
  }

  const {scopeName} = editor.getGrammar()
  return Object.assign(getConfig("prettierOptions"), {
    parser: parserNameByScopeName[scopeName] || getConfig("javascriptParser"),
  })
}

function withFormat(text, options, fn) {
  const newText = prettier.format(text, options)
  if (newText !== text) fn(newText)
}

function format(editor) {
  const options = getPrettierOptions(editor)
  if (getConfig("debug")) console.log(options)

  const selection = editor.getLastSelection()
  if (!selection.isEmpty()) {
    withFormat(selection.getText(), options, text => {
      selection.insertText(text)
    })
  } else {
    const point = editor.getCursorBufferPosition()
    withFormat(editor.getText(), options, text => {
      editor.setText(text)
      editor.setCursorBufferPosition(point)
    })
  }
}

const Config = {
  javascriptParser: {
    order: 0,
    type: "string",
    default: "babylon",
    enum: ["babylon", "flow"],
  },
  debug: {
    order: 1,
    type: "boolean",
    default: false,
  },
}

module.exports = {
  config: Config,
  activate() {
    this.disposable = atom.commands.add("atom-text-editor:not([mini])", "mprettier:format", function() {
      format(this.getModel())
    })
  },

  deactivate() {
    this.disposable.dispose()
  },
}
