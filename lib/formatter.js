const {
  getConfig,
  isInProjectDependencies,
  needFormatByStarndard,
  getPrettierFormatter,
  getStandardFormatter,
  withFormat,
  detectParser
} = require('./utils')
const Path = require('path')

class Mprettier {
  static initClass () {
    this.disabledFiles = []
  }

  static format (editor, onSave) {
    new Mprettier(editor).format(onSave)
  }

  static async clipDebugInfo (editor) {
    // const formatter = new Mprettier(editor).format(onSave)
    // const {prettier, which} = await formatter.findPrettier(editor)
    // const text = require('util').inspect(formatter.buildDebuggInfo({prettier, which}), {depth: null})
    // atom.clipboard.write(text)
  }

  static toggleDisableFilePathForEditor (editor) {
    const filePath = editor.getPath()
    if (!filePath) return
    if (this.isDisabledFile(filePath)) {
      const index = this.disabledFiles.indexOf(filePath)
      this.disabledFiles.splice(index, 1)
    } else {
      this.disabledFiles.push(filePath)
    }
  }

  static isDisabledFile (filePath) {
    return this.disabledFiles.includes(filePath)
  }

  constructor (editor) {
    this.editor = editor
  }

  isDisabledFile (filePath) {
    return this.constructor.isDisabledFile(filePath)
  }

  skipFormat (editor) {
    return (
      !getConfig('formatOnSave.enable') ||
      this.isDisabledFile(editor.getPath()) ||
      (getConfig('formatOnSave.skipWhenPrettierIsNotProjectDependencies') &&
        !isInProjectDependencies(editor, 'prettier'))
    )
  }

  async format (onSave) {
    let usePrettier = true
    const editor = this.editor

    if (onSave && this.skipFormat(editor)) return

    const useStandard = needFormatByStarndard(editor)

    if (getConfig('skipPrettierWhenFormatByStandardForJavascriptIfStandardIsProjectDependencies')) {
      if (useStandard && !getConfig('formatByStandardForJavascript')) {
        usePrettier = false
      }
    }

    const formatters = []
    if (usePrettier) formatters.push(await getPrettierFormatter(editor, onSave))
    if (useStandard) formatters.push(await getStandardFormatter(editor))

    const selection = editor.getLastSelection()
    if (!selection.isEmpty()) {
      withFormat(formatters, selection.getText(), text => {
        selection.insertText(text)
      })
    } else {
      withFormat(formatters, editor.getText(), text => {
        const point = editor.getCursorBufferPosition()
        editor.setText(text)
        editor.setCursorBufferPosition(point)
      })
    }
  }

  buildDebuggInfo ({prettier, which, prettierOptions}) {
    const editor = this.editor

    if (!prettierOptions) {
      prettierOptions = (prettier && prettier.resolveConfig.sync(editor.getPath())) || getConfig('prettierOptions')
      Object.assign(prettierOptions, {parser: detectParser(editor)})
    }

    return {
      atomVersion: atom.getVersion(),
      platform: process.platform,
      mprettierVersion: require(Path.join(Path.dirname(__dirname), 'package.json')).version,
      editorGrammarScope: editor.getGrammar().scopeName,
      prettierVersion: prettier ? prettier.version : undefined,
      prettierToUse: which,
      prettierOptions: prettierOptions,
      mprettierConfig: atom.config.get('mprettier')
    }
  }
}
Mprettier.initClass()

module.exports = Mprettier
