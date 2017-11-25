const {CompositeDisposable} = require("atom")
let Formatter
const getFormatter = () => Formatter || (Formatter = require("./formatter"))
const newFormatter = editor => new (getFormatter())(editor)

module.exports = {
  activate() {
    this.disposables = new CompositeDisposable(
      atom.workspace.observeActiveTextEditor(editor => {
        this.disposeEditorDisposable()
        if (!editor) return
        this.editorDisposable = editor.buffer.onWillSave(() => newFormatter(editor).format(true))
      }),
      atom.commands.add("atom-text-editor:not([mini])", {
        "mprettier:format"() {
          newFormatter(this.getModel()).format()
        },
        "mprettier:clip-debug-info"() {
          newFormatter(this.getModel()).clipDebugInfo()
        },
        "mprettier:toggle-disable-file"() {
          getFormatter().toggleDisableFile(this.getModel().getPath())
        },
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
