var ensureRequire = require('../ensure-require.js')
var fs = require('fs')
var path = require('path')
var json = require('json5')

var defaultBabelOptions = {
  presets: ['@babel/env', ['@babel/typescript', {
    allExtensions: true
  }]],
  plugins: [
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true
      }
    ],
    ['@babel/proposal-class-properties', {
      loose: true
    }],
    ["@babel/plugin-transform-typescript", {
      allowNamespaces: true
    }]
  ]
}

var babelRcPath = path.resolve(process.cwd(), '.babelrc')
var babelOptions = fs.existsSync(babelRcPath) ? Object.assign(getBabelRc(), defaultBabelOptions) : defaultBabelOptions

function getBabelRc() {
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
    var babel = require('@babel/core')
    var options = Object.assign({
      comments: false,
      filename: filePath,
      sourceMaps: compiler.options.sourceMap
    }, compiler.options.babel || babelOptions)
    var res = babel.transform(raw, options)
  } catch (err) {
    return cb(err)
  }
  cb(null, res)
}