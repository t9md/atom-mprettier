const Path = require('path')
const fs = require('fs-plus')
const readPgkUp = require('read-pkg-up')
const {BufferedProcess} = require('atom')
let NODE_PREFIX, BUNDLED_STANDARD

function getConfig (param) {
  return atom.config.get(`mprettier.${param}`)
}

function hasClosestPackageJsonHasPackage (cwd, name) {
  const result = readPgkUp.sync({cwd})
  if (!result || !result.pkg) return false
  const {dependencies, devDependencies} = result.pkg
  return (dependencies && name in dependencies) || (devDependencies && name in devDependencies)
}

function isInProjectDependencies (editor, packageName) {
  return hasClosestPackageJsonHasPackage(Path.dirname(editor.getPath()), packageName)
}

async function findPrettier (editor) {
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
  const detectInDirectory = (...dirs) => detectFile(Path.join(...dirs, 'node_modules', 'prettier', 'index.js'))

  if (shouldFind('inCurrentFileDirectory')) {
    detectInDirectory(Path.dirname(editor.getPath()))
  }

  if (!libPath && shouldFind('inCurrentProject')) {
    const dir = atom.project.getDirectories().find(dir => dir.contains(editor.getPath()))
    dir && detectInDirectory(dir.getPath())
  }

  if (!libPath && shouldFind('inAbsolutePath')) {
    detectFile(getConfig('prettierToUseInOrder.prettierPath')) // dont use `shouldFind`
  }

  if (!libPath && shouldFind('globallyInstalled')) {
    if (!NODE_PREFIX) NODE_PREFIX = await getNodePrefixPath()
    if (NODE_PREFIX) {
      detectInDirectory(NODE_PREFIX) || detectInDirectory(NODE_PREFIX, 'lib') // Windows || non Windows
    }
  }

  if (!libPath && shouldFind('bundled')) {
    detectInDirectory(Path.dirname(__dirname))
  }

  return libPath ? {prettier: require(libPath), which} : {}
}

function getNodePrefixPath () {
  let resolveOutput
  const exitPromise = new Promise(resolve => (resolveOutput = resolve))

  let data = ''
  const options = {
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['get', 'prefix'],
    stdout: _data => (data += _data),
    exit: () => resolveOutput(data.trim())
  }
  const bufferedProcess = new BufferedProcess(options)
  bufferedProcess.onWillThrowError(({error, handle}) => {
    if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
      console.log('ERROR')
    }
    handle()
  })
  return exitPromise
}

function getStandardAndPkgConfig (editor) {
  const result = readPgkUp.sync({cwd: Path.dirname(editor.getPath())})
  if (result && result.pkg) {
    const {dependencies, devDependencies, standard: standardPkgConfig} = result.pkg
    if ((dependencies && 'standard' in dependencies) || (devDependencies && 'standard' in devDependencies)) {
      const libPath = Path.join(Path.dirname(result.path), 'node_modules', 'standard')
      return {standard: require(libPath), pkgConfig: standardPkgConfig}
    }
  }
  if (!BUNDLED_STANDARD) BUNDLED_STANDARD = require('standard')
  return {standard: BUNDLED_STANDARD}
}

function withFormat (formatters, text, fn) {
  try {
    let newText = text
    for (const formatter of formatters) {
      const result = formatter(newText)
      if (result != null) {
        newText = result
      }
    }
    if (newText !== text) fn(newText)
  } catch (error) {
    const notificationMethod = getConfig('notificationMethodOnPrettierError')
    if (notificationMethod === 'atom-notification') {
      const message = error.stack.replace(/\r?\n/g, m => '  ' + m)
      atom.notifications.addWarning(message, {dismissable: true})
    } else if (notificationMethod === 'console') {
      console.warn(error.stack)
    }
  }
}

function detectParser (editor) {
  const {scopeName} = editor.getGrammar()
  const scopesByParserName = getConfig('scopesForParser')
  for (const parserName of Object.keys(scopesByParserName)) {
    if (parserName === 'javascriptParser') continue
    if (scopesByParserName[parserName].includes(scopeName)) {
      return parserName === 'javascript' ? scopesByParserName.javascriptParser : parserName
    }
  }
}

function isJavaScriptGrammar (editor) {
  const {scopeName} = editor.getGrammar()
  return getConfig('scopesForParser').javascript.includes(scopeName)
}

function needFormatByStarndard (editor) {
  return (
    isJavaScriptGrammar(editor) &&
    (getConfig('formatByStandardForJavascript') ||
      (getConfig('formatByStandardForJavascriptIfStandardIsProjectDependencies') &&
        isInProjectDependencies(editor, 'standard')))
  )
}

async function getPrettierFormatter (editor, onSave) {
  const {prettier} = await findPrettier(editor)
  if (!prettier) {
    atom.notifications.addWarning('mprettier: prettier not found', {dismissable: true})
    return
  }
  prettier.clearConfigCache()
  const resolvedPrettierConfig = prettier.resolveConfig.sync(editor.getPath())
  const prettierOptions = resolvedPrettierConfig || getConfig('prettierOptions')
  Object.assign(prettierOptions, {parser: detectParser(editor)})
  const parser = prettierOptions.parser

  if (
    (onSave && getConfig('formatOnSave.skipWhenPrettierConfigIsNotFound') && !resolvedPrettierConfig) ||
    !parser ||
    (onSave && getConfig('formatOnSave.disabledParsers').includes(parser))
  ) {
    return
  }

  return text => prettier.format(text, prettierOptions)
}

async function getStandardFormatter (editor) {
  const {standard, pkgConfig} = getStandardAndPkgConfig(editor)
  pkgConfig.fix = true

  if (!standard) return

  return text => {
    const result = standard.lintTextSync(text, pkgConfig)
    if (result.results[0].output) {
      return result.results[0].output
    }
  }
}

module.exports = {
  getConfig,
  hasClosestPackageJsonHasPackage,
  isInProjectDependencies,
  findPrettier,
  getNodePrefixPath,
  getStandardAndPkgConfig,
  withFormat,
  detectParser,
  isJavaScriptGrammar,
  getStandardFormatter,
  needFormatByStarndard,
  getPrettierFormatter
}
