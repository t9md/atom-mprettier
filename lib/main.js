let Mprettier
const getMprettier = () => Mprettier || (Mprettier = require('./formatter'))

module.exports = {
  activate () {
    let skipFormat = false

    this.workspaceDisposable = atom.workspace.observeActiveTextEditor(editor => {
      if (this.activeEditorDisposable) this.activeEditorDisposable.dispose()
      if (!editor) return
      this.activeEditorDisposable = editor.buffer.onWillSave(() => skipFormat || getMprettier().format(editor, true))
    })
    this.commandDisposable = atom.commands.add('atom-text-editor:not([mini])', {
      'mprettier:format' () {
        getMprettier().format(this.getModel())
      },
      'mprettier:save-without-format' () {
        skipFormat = true
        const editor = this.getModel()
        editor.save().then(() => (skipFormat = false))
      },
      'mprettier:clip-debug-info' () {
        getMprettier().clipDebugInfo(this.getModel())
      },
      'mprettier:toggle-disable-file' () {
        getMprettier().toggleDisableFilePathForEditor(this.getModel())
      }
    })
  },
  deactivate () {
    this.workspaceDisposable.dispose()
    this.commandDisposable.dispose()
    if (this.activeEditorDisposable) this.activeEditorDisposable.dispose()
  }
}
