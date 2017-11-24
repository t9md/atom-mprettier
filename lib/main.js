const Formatter = require("./formatter")

module.exports = {
  activate() {
    this.disposable = atom.commands.add("atom-text-editor:not([mini])", "mprettier:format", function() {
      new Formatter(this.getModel()).format()
    })
  },

  deactivate() {
    this.disposable.dispose()
  },
}
