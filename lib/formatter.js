const path = require("path")
const fs = require("fs-plus")
const {BufferedProcess} = require("atom")
let NODE_PREFIX

const parserNameByScopeName = {
  "source.json": "json",
  "text.md": "markdown",
  "source.gfm": "markdown",
  "source.ts": "typescript",
}

function getConfig(param) {
  return atom.config.get(`mprettier.${param}`)
}

async function detectPrettierPath(editor) {
  const filePath = editor.getPath()

  const detect = libPath => fs.isFileSync(libPath) && libPath
  const detectInDirectory = (...dirs) => detect(path.join(...dirs, "node_modules", "prettier", "index.js"))

  let source
  // 1
  source = "usePrettierInCurrentFileDirectory"
  if (getConfig(source)) {
    const libPath = detectInDirectory(path.dirname(filePath))
    if (libPath) return {libPath, source}
  }

  // 2
  source = "usePrettierInCurrentProject"
  if (getConfig(source)) {
    const dir = atom.project.getDirectories().find(dir => dir.contains(filePath))
    const libPath = dir && detectInDirectory(dir.getPath())
    if (libPath) return {libPath, source}
  }

  // 3
  source = "usePrettierInAbsolutePath"
  if (getConfig(source)) {
    const libPath = detect(getConfig("prettierInAbsolutePath"))
    if (libPath) return {libPath, source}
  }

  // 4
  source = "usePrettierGloballyInstalled"
  if (getConfig(source)) {
    if (!NODE_PREFIX) NODE_PREFIX = await getNodePrefixPath()
    if (NODE_PREFIX) {
      // Windows || non Windows
      const libPath = detectInDirectory(NODE_PREFIX) || detectInDirectory(NODE_PREFIX, "lib")
      if (libPath) return {libPath, source}
    }
  }

  source = "usePrettierBundled"
  if (getConfig(source)) {
    const libPath = detectInDirectory(path.dirname(__dirname))
    if (libPath) return {libPath, source}
  }

  return {}
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

module.exports = class Formatter {
  constructor(editor) {
    this.editor = editor
  }

  getPrettierOptions(prettier) {
    const filePath = this.editor.getPath()
    if (filePath) {
      const options = prettier.resolveConfig.sync(filePath)
      if (options) return options
    }

    const {scopeName} = this.editor.getGrammar()
    return Object.assign(getConfig("prettierOptions"), {
      parser: parserNameByScopeName[scopeName] || getConfig("javascriptParser"),
    })
  }

  async clipDebugInfo() {
    const pkgVersion = require(path.join(path.dirname(__dirname), "package.json")).version

    const {libPath, source} = await detectPrettierPath(this.editor)
    const prettier = libPath ? require(libPath) : undefined
    const prettierOptions = prettier ? this.getPrettierOptions(prettier) : undefined

    const prettierInfo = {
      atomVersion: atom.getVersion(),
      platform: process.platform,
      mprettierVersion: pkgVersion,
      prettierVersion: prettier.version,
      prettierPath: libPath,
      prettierSource: source,
      prettierOptions: prettierOptions,
      mprettierConfig: atom.config.get("mprettier"),
    }
    const text = require("util").inspect(prettierInfo, {depth: null})
    atom.clipboard.write(text)
  }

  async format() {
    const editor = this.editor

    const {libPath, source} = await detectPrettierPath(editor)
    const prettier = libPath ? require(libPath) : undefined
    if (!prettier) {
      atom.notifications.addWarning("mprettier: prettier not found", {dismissable: true})
      return
    }
    const prettierOptions = this.getPrettierOptions(prettier)

    if (getConfig("debug")) {
      const prettierInfo = {
        prettierVersion: prettier.version,
        prettierPath: libPath,
        prettierSource: source,
        prettierOptions: prettierOptions,
      }
      console.log(require("util").inspect(prettierInfo, {depth: null}))
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
}
