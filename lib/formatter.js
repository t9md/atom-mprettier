const path = require("path")
const fs = require("fs-plus")
const readPgkUp = require("read-pkg-up")
const {BufferedProcess} = require("atom")
let NODE_PREFIX

function getConfig(param) {
  return atom.config.get(`mprettier.${param}`)
}

function getPrettierToUseConfig(param) {
  return getConfig(`prettierToUseInOrder.${param}`)
}

function hasClosestPackageJsonHasPackage(cwd, name) {
  const result = readPgkUp.sync({cwd})
  if (!result || !result.pkg) return false
  const {dependencies, devDependencies} = result.pkg
  return (dependencies && name in dependencies) || (devDependencies && name in devDependencies)
}

function prettierIsProjectDependencies(editor) {
  return hasClosestPackageJsonHasPackage(path.dirname(editor.getPath()), "prettier")
}

async function findPrettier(editor) {
  let which, libPath

  const shouldFind = param => {
    which = param
    return getConfig(`prettierToUseInOrder.${param}`)
  }
  const detectFile = filePath => {
    if (fs.isFileSync(filePath)) {
      libPath = filePath
    }
    return !!libPath
  }
  const detectInDirectory = (...dirs) => detectFile(path.join(...dirs, "node_modules", "prettier", "index.js"))

  if (shouldFind("inCurrentFileDirectory")) {
    detectInDirectory(path.dirname(editor.getPath()))
  }

  if (!libPath && shouldFind("inCurrentProject")) {
    const dir = atom.project.getDirectories().find(dir => dir.contains(editor.getPath()))
    dir && detectInDirectory(dir.getPath())
  }

  if (!libPath && shouldFind("inAbsolutePath")) {
    detectFile(getConfig("prettierToUseInOrder.prettierPath")) // dont use `shouldFind`
  }

  if (!libPath && shouldFind("globallyInstalled")) {
    if (!NODE_PREFIX) NODE_PREFIX = await getNodePrefixPath()
    if (NODE_PREFIX) {
      detectInDirectory(NODE_PREFIX) || detectInDirectory(NODE_PREFIX, "lib") // Windows || non Windows
    }
  }

  if (!libPath && shouldFind("bundled")) {
    detectInDirectory(path.dirname(__dirname))
  }

  return libPath ? {prettier: require(libPath), which} : {}
}

function getNodePrefixPath() {
  let resolveOutput
  const exitPromise = new Promise(resolve => (resolveOutput = resolve))

  let data = ""
  const options = {
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args: ["get", "prefix"],
    stdout: _data => (data += _data),
    exit: () => resolveOutput(data.trim()),
  }
  const bufferedProcess = new BufferedProcess(options)
  bufferedProcess.onWillThrowError(({error, handle}) => {
    if (error.code === "ENOENT" && error.syscall.indexOf("spawn") === 0) {
      console.log("ERROR")
    }
    handle()
  })
  return exitPromise
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

function detectParser(editor) {
  const {scopeName} = editor.getGrammar()
  const scopesByParserName = getConfig("scopesForParser")
  for (const parserName of Object.keys(scopesByParserName)) {
    if (parserName === "javascriptParser") continue
    if (scopesByParserName[parserName].includes(scopeName)) {
      return parserName === "javascript" ? scopesByParserName.javascriptParser : parserName
    }
  }
}

class Formatter {
  static initClass() {
    this.disabledFiles = []
  }

  static toggleDisableFile(filePath) {
    if (!filePath) return
    if (this.isDisabledFile(filePath)) {
      const index = this.disabledFiles.indexOf(filePath)
      this.disabledFiles.splice(index, 1)
    } else {
      this.disabledFiles.push(filePath)
    }
  }

  static isDisabledFile(filePath) {
    return this.disabledFiles.includes(filePath)
  }

  constructor(editor) {
    this.editor = editor
  }

  isDisabledFile(filePath) {
    return this.constructor.isDisabledFile(filePath)
  }

  async format(onSave) {
    const editor = this.editor
    const filePath = editor.getPath()

    if (onSave) {
      if (
        !getConfig("formatOnSave.enable") ||
        this.isDisabledFile(editor.getPath()) ||
        (getConfig("formatOnSave.skipWhenPrettierIsNotProjectDependencies") && !prettierIsProjectDependencies(editor))
      ) {
        return
      }
    }

    const {prettier, which} = await findPrettier(editor)
    if (!prettier) {
      atom.notifications.addWarning("mprettier: prettier not found", {dismissable: true})
      return
    }
    prettier.clearConfigCache()
    const resolvedPrettierConfig = prettier.resolveConfig.sync(editor.getPath())
    const prettierOptions = resolvedPrettierConfig || getConfig("prettierOptions")
    Object.assign(prettierOptions, {parser: detectParser(editor)})
    const parser = prettierOptions.parser

    if (getConfig("debug")) {
      const debugInfo = this.buildDebuggInfo({prettier, libPath, which, prettierOptions})
      console.log(require("util").inspect(debugInfo, {depth: null}))
    }

    if (
      (onSave && getConfig("formatOnSave.skipWhenPrettierConfigIsNotFound") && !resolvedPrettierConfig) ||
      !parser ||
      (onSave && getConfig("formatOnSave.disabledParsers").includes(parser))
    ) {
      return
    }

    const selection = editor.getLastSelection()
    if (!selection.isEmpty()) {
      withFormat(prettier, selection.getText(), prettierOptions, text => {
        selection.insertText(text)
      })
    } else {
      const point = editor.getCursorBufferPosition()
      withFormat(prettier, editor.getText(), prettierOptions, text => {
        editor.setText(text)
        editor.setCursorBufferPosition(point)
      })
    }
  }

  buildDebuggInfo({prettier, libPath, which, prettierOptions}) {
    const editor = this.editor

    if (!prettierOptions) {
      prettierOptions = (prettier && prettier.resolveConfig.sync(editor.getPath())) || getConfig("prettierOptions")
      Object.assign(prettierOptions, {parser: detectParser(editor)})
    }

    return {
      atomVersion: atom.getVersion(),
      platform: process.platform,
      mprettierVersion: require(path.join(path.dirname(__dirname), "package.json")).version,
      editorGrammarScope: editor.getGrammar().scopeName,
      prettierVersion: prettier ? prettier.version : undefined,
      prettierPath: libPath,
      prettierToUse: which,
      prettierOptions: prettierOptions,
      mprettierConfig: atom.config.get("mprettier"),
    }
  }

  async clipDebugInfo() {
    const pkgVersion = require(path.join(path.dirname(__dirname), "package.json")).version
    const {prettier, which} = await findPrettier(editor)
    const text = require("util").inspect(this.buildDebuggInfo({prettier, libPath, which}), {depth: null})
    atom.clipboard.write(text)
  }
}
Formatter.initClass()

module.exports = Formatter
