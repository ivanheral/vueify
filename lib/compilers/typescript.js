var ensureRequire = require('../ensure-require.js')
var fs = require('fs')
var path = require('path')
var json = require('json5')
var assign = require('object-assign')

var defaultBabelOptions = {
  presets: ['@babel/env']
}

var babelRcPath = path.resolve(process.cwd(), '.babelrc')
var babelOptions = fs.existsSync(babelRcPath) ? getBabelRc() || defaultBabelOptions : defaultBabelOptions

function getBabelRc () {
  var rc
  try {
    rc = json.parse(fs.readFileSync(babelRcPath, 'utf-8'))
  } catch (e) {
    throw new Error('[vueify] Your .babelrc seems to be incorrectly formatted.')
  }
  return rc
}

module.exports = function (raw, cb, compiler, filePath) {
  ensureRequire('ts', ['typescript'])

  try {
    var ts = require('typescript')
    var babel = require('@babel/core')
    var res = ts.transpileModule(raw, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext
      }
    })

    var options = assign(
      {
        comments: false,
        filename: filePath,
        sourceMaps: compiler.options.sourceMap
      }, compiler.options.babel || babelOptions)

    var out = babel.transform(res.outputText, options)
  } catch (err) {
    return cb(err)
  }
  cb(null, out)
}
