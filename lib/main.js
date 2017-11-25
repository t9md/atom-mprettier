let Formatter

function getFormatter(editor) {
  if (!Formatter) Formatter = require("./formatter")
  return new Formatter(editor)
}

module.exports = {
  activate() {
    this.disposable = atom.commands.add("atom-text-editor:not([mini])", {
      "mprettier:format"() {
        getFormatter(this.getModel()).format()
      },
      "mprettier:clip-debug-info"() {
        getFormatter(this.getModel()).clipDebugInfo()
      },
    })
  },

  deactivate() {
    this.disposable.dispose()
  },
}
