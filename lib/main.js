const {CompositeDisposable} = require("atom")
let Formatter
const getFormatter = editor => new (Formatter || (Formatter = require("./formatter")))(editor)

module.exports = {
  activate() {
    this.disposables = new CompositeDisposable(
      atom.workspace.observeActiveTextEditor(editor => {
        this.disposeEditorDisposable()
        if (!editor) return
        this.editorDisposable = editor.buffer.onWillSave(() => getFormatter(editor).format(true))
      }),
      // prettier-ignore
      atom.commands.add("atom-text-editor:not([mini])", {
        "mprettier:format"() { getFormatter(this.getModel()).format() },
        "mprettier:clip-debug-info"() { getFormatter(this.getModel()).clipDebugInfo() },
      })
    )
  },
  deactivate() {
    this.disposables.dispose()
    this.disposeEditorDisposable()
  },
  disposeEditorDisposable() {
    if (this.editorDisposable) {
      this.editorDisposable.dispose()
      this.editorDisposable = null
    }
  },
}
