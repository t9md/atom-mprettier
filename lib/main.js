const {Disposable, CompositeDisposable} = require("atom")
const prettier = require("prettier")

function format(text, options) {
  return prettier.format(text, options)
}

function detectParserToUse(editor) {
  const {scopeName} = editor.getGrammar()
  if (scopeName === "source.json") return "json"
}

module.exports = {
  activate() {
    this.disposable = atom.commands.add("atom-text-editor:not([mini])", "mprettier:format", function(event) {
      const editor = this.getModel()
      const options = atom.config.get("mprettier.prettierOptions")
      Object.assign(options, {parser: detectParserToUse(editor)})
      const selection = editor.getLastSelection()
      if (!selection.isEmpty()) {
        const result = format(selection.getText(), options)
        selection.insertText(result)
      } else {
        const result = format(editor.getText(), options)
        const point = editor.getCursorBufferPosition()
        editor.setText(result)
        editor.setCursorBufferPosition(point)
      }
    })
  },

  deactivate() {
    this.disposable.dispose()
  },
}
