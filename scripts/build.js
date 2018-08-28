'use strict'

const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')

const printError = (err) => {
  console.error(chalk`{red Build error}`)
  if (err !== null) {
    err.toString().trim().split('\n').forEach((message) => {
      console.error(message)
    })
  }
  process.exitCode = 1
}

const printSuccess = (stats) => {
  console.log(chalk `Build {green ${stats.hash}} finished ${stats.hasWarnings()
    ? chalk`{yellow with warnings} `
    : ''}in {green ${stats.endTime - stats.startTime}ms}`)
  if (stats.hasWarnings()) {
    stats.compilation.warnings.map(warn => log(chalk `[{yellow WARN}] ${warn.toString()}`))
  }
}

webpack({
  entry: './frontend/app.js',
  output: {
    path: path.resolve('build'),
    filename: 'app.min.js',
  },
  module: {
    rules: [{
      test: /\.js/i,
      loader: 'babel-loader',
      options: {
        presets: ['env'],
      },
    }],
  },
  mode: 'production',
}, (err, stats) => {
  if (err || stats.hasErrors()) {
    printError(err || stats.compilation.errors[0] || null)
    return
  }
  printSuccess(stats)
})
