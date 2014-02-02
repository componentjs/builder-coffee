var vm = require('vm')
var co = require('co')
var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var assert = require('assert')
var Resolver = require('component-resolver')
var Builder = require('component-builder2')
var Remotes = require('remotes')
var join = require('path').join

function fixture(name) {
  return join(__dirname, 'fixtures', name)
}

function build(nodes, options) {
  return new Builder.scripts(nodes, options)
    .use('coffee', require('..')({
      sourceMap: true
    }))
    .use('scripts', Builder.plugins.js())
}

describe('blah', function () {
  var tree
  var nodes
  var js

  it('should install', co(function* () {
    var resolver = new Resolver(fixture('blah'), {})
    tree = yield* resolver.tree()
    nodes = resolver.flatten(tree)
  }))

  it('should build', co(function* () {
    var builder = build(nodes)
    js = yield builder.toStr()
  }))

  it('should execute', function () {
    var ctx = vm.createContext()
    vm.runInContext(js, ctx)
    vm.runInContext('if (require("blah") !== "asdf") throw new Error()', ctx)
  })
})

describe('sauce', function () {
  var tree
  var nodes
  var js

  it('should install', co(function* () {
    var resolver = new Resolver(fixture('blah'), {})
    tree = yield* resolver.tree()
    nodes = resolver.flatten(tree)
  }))

  it('should build', co(function* () {
    var builder = build(nodes, {
      development: true
    })
    js = yield builder.toStr()
    mkdirp(path.join(__dirname, '..', 'build'))
    fs.writeFileSync(path.join(__dirname, '..', 'build', 'build.js'), js)
  }))

  it('should execute', function () {
    var ctx = vm.createContext()
    vm.runInContext(js, ctx)
    vm.runInContext('if (require("blah") !== "asdf") throw new Error()', ctx)
  })
})