'use strict';

var fs = require('fs');
var assert = require('assert');
var Mixin = require('./types/mixin');
var Func = require('./types/func');
var parsers = require('./parsers');

function setVariables(varz) {
  var sassVariables = '';
  for (var variableName in varz) {
    sassVariables = sassVariables + '$' + variableName + ':' + varz[variableName] + ';';
  }
  return sassVariables;
}

function setDependencies(dependencies) {
  var sassImports = '';
  dependencies.forEach(function(fileName) {
    sassImports = sassImports + fs.readFileSync(fileName).toString();
  });
  return sassImports;
}

function Sassaby(path, options) {
  options = options || {};
  this.path = path;
  this.file = fs.readFileSync(path).toString();
  this.variables = '';
  this.dependencies = '';

  if (options.variables) {
    this.variables = setVariables(options.variables);
  }

  if (options.dependencies) {
    this.dependencies = setDependencies(options.dependencies);
  }
}

Sassaby.prototype = {
  imports: function(name) {
    var message = 'Could not find an import statement with ' + name + ' in file.';
    assert(parsers.hasImport(this.file, name), message);
  },

  doesNotImport: function(name) {
    var message = 'Found an import statement with ' + name + ' in file.';
    assert(!parsers.hasImport(this.file, name), message);
  },

  includedMixin: function(call) {
    return new Mixin('included', this.variables, this.dependencies, this.file, call);
  },

  standaloneMixin: function(call) {
    return new Mixin('standalone', this.variables, this.dependencies, this.file, call);
  },

  func: function(call) {
    return new Func(this.variables, this.dependencies, this.file, call);
  }
};

if (process.env.NODE_ENV === 'test') {
  Sassaby.setVariables = setVariables;
  Sassaby.setDependencies = setDependencies;
}

module.exports = Sassaby;
