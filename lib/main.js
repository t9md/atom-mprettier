const Formatter = require("./formatter")

module.exports = {
  activate() {
    this.disposable = atom.commands.add("atom-text-editor:not([mini])", {
      "mprettier:format"() {
        new Formatter(this.getModel()).format()
      },
      "mprettier:clip-debug-info"() {
        new Formatter(this.getModel()).clipDebugInfo()
      },
    })
  },

  deactivate() {
    this.disposable.dispose()
  },
}
