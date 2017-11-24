const path = require("path")
const fs = require("fs-plus")
const bundledPrettier = require("prettier")

const parserNameByScopeName = {
  "source.json": "json",
  "text.md": "markdown",
  "source.gfm": "markdown",
  "source.ts": "typescript",
}

function getConfig(param) {
  return atom.config.get(`mprettier.${param}`)
}

function getPrettierLib(editor) {
  const prettierPath = detectPrettierPath(editor)
  if (prettierPath) {
    return require(prettierPath)
  }

  if (getConfig("usePrettierBundled")) {
    return bundledPrettier
  }
}

function detectPrettierPath(editor) {
  const filePath = editor.getPath()
  const pathToPrettier = path.join("node_modules", "prettier", "index.js")

  if (getConfig("usePrettierInCurrentFileDir")) {
    const candidate = path.join(path.dirname(filePath), pathToPrettier)
    if (fs.isFileSync(candidate)) return candidate
  }

  if (getConfig("usePrettierInCurrentProject")) {
    const dir = atom.project.getDirectories().find(dir => dir.contains(filePath))
    if (dir) {
      const candidate = path.join(dir.getPath(), pathToPrettier)
      if (fs.isFileSync(candidate)) return candidate
    }
  }
  
  if (getConfig("usePrettierGloballyInstalled")) {
    // FIXME
  }
}

function withFormat(prettier, text, options, fn) {
  try {
    const newText = prettier.format(text, options)
    if (newText !== text) fn(newText)
  } catch (error) {
    const notificationMethod = getConfig("notificationMethodOnPrettierError")
    if (notificationMethod === "atom-notification") {
      const message = error.stack.replace(/\r?\n/g, m => "  " + m)
      atom.notifications.addWarning(message, {dismissable: true})
    } else if (notificationMethod === "console") {
      console.warn(error.stack)
    }
  }
}

module.exports = class Formatter {
  constructor(editor) {
    this.editor = editor
  }

  getPrettierOptions() {
    const filePath = this.editor.getPath()
    if (filePath) {
      const options = bundledPrettier.resolveConfig.sync(filePath)
      if (options) return options
    }

    const {scopeName} = this.editor.getGrammar()
    return Object.assign(getConfig("prettierOptions"), {
      parser: parserNameByScopeName[scopeName] || getConfig("javascriptParser"),
    })
  }

  format() {
    const editor = this.editor

    const prettier = getPrettierLib(editor)
    if (!prettier) {
      atom.notifications.addWarning("mprettier: prettier not found", {dismissable: true})
      return
    }
    const options = this.getPrettierOptions()

    const selection = editor.getLastSelection()
    if (!selection.isEmpty()) {
      withFormat(prettier, selection.getText(), options, text => {
        selection.insertText(text)
      })
    } else {
      const point = editor.getCursorBufferPosition()
      withFormat(prettier, editor.getText(), options, text => {
        editor.setText(text)
        editor.setCursorBufferPosition(point)
      })
    }
  }
}
