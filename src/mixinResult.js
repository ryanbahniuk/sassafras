'use strict';

var assert = require('assert');
var cssmin = require('cssmin');
var utilities = require('./utilities');
var parsers = require('./parsers');

function wrapMixinWithArgs(type, call, args) {
  var argString = utilities.concatArgs(args);
  var includeString = '@include ' + call + '(' + argString +  ');';
  return type === 'included' ? '.test{' + includeString + '}' : includeString;
}

function wrapMixinWithBlock(type, call, block) {
  var includeString =  '@include ' + call + '{' + block + '}';
  return type === 'included' ? '.test{' + includeString + '}' : includeString;
}

function wrapMixinWithBlockAndArgs(type, call, block, args) {
  var argString = utilities.concatArgs(args);
  var includeString =  '@include ' + call + '(' + argString +  ') ' + '{' + block + '}';
  return type === 'included' ? '.test{' + includeString + '}' : includeString;
}

function wrapMixin(type, call) {
  var includeString = '@include ' + call + ';';
  return type === 'included' ? '.test{' + includeString + '}' : includeString;
}

function wrapOutput(type, css) {
  if (type === 'included') {
    return cssmin('.test{' + css + '}');
  } else {
    return cssmin(css);
  }
}

function unwrapOutput(type, css) {
  var unwrapped = css;
  if (type === 'included') {
    unwrapped = unwrapped.replace(/^.test{/g, '').replace(/\}$/g, '');
  }

  return unwrapped.replace(/;$/g, '');
}

function compileCss(file, type, call, args, block) {
  if (args && args.length > 0 && block) {
    return utilities.createCss(file, wrapMixinWithBlockAndArgs(type, call, block, args));
  } else if (args && args.length > 0) {
    return utilities.createCss(file, wrapMixinWithArgs(type, call, args));
  } else if (block) {
    return utilities.createCss(file, wrapMixinWithBlock(type, call, block));
  } else {
    return utilities.createCss(file, wrapMixin(type, call));
  }
}

function MixinResult(type, file, call, args, block) {
  this.type = type;
  this.file = file;
  this.css = compileCss(file, type, call, args, block);
  this.ast = utilities.createAst(this.css);
}

MixinResult.prototype = {
  createsSelector: function(selector) {
    if (this.type === 'included') {
      throw 'createsSelector is not available for included mixins.';
    }
    var message = 'Could not find selector ' + selector + ' in mixin output.';
    assert(parsers.hasSelector(this.ast, selector), message);
  },

  doesNotCreateSelector: function(selector) {
    if (this.type === 'included') {
      throw 'doesNotCreateSelector is not available for included mixins.';
    }
    var message = 'Mixin created selector ' + selector + '.';
    assert(!parsers.hasSelector(this.ast, selector), message);
  },

  createsMediaQuery: function(mediaQuery) {
    var rule = parsers.findMedia(this.ast);
    var media = rule ? rule.media : '';
    var message = 'Could not find a media query rule with the value: ' + mediaQuery + '.';
    assert.equal(media, cssmin(mediaQuery), message);
  },

  doesNotCreateMediaQuery: function(mediaQuery) {
    var rule = parsers.findMedia(this.ast);
    var media = rule ? rule.media : '';
    var message = 'Found a media query rule with the value: ' + mediaQuery + '.';
    assert.notEqual(media, cssmin(mediaQuery), message);
  },

  createsFontFace: function() {
    if (this.type === 'included') {
      throw 'createsFontFace is not available for included mixins.';
    }
    var message = 'Could not find a font-face rule.';
    assert(parsers.hasFontFace(this.ast), message);
  },

  doesNotCreateFontFace: function() {
    if (this.type === 'included') {
      throw 'doesNotCreateFontFace is not available for included mixins.';
    }
    var message = 'Mixin created a font-face rule.';
    assert(!parsers.hasFontFace(this.ast), message);
  },

  hasNumDeclarations: function(num) {
    var numDeclarations = parsers.countDeclarations(this.ast);
    var message = 'Mixin has ' + numDeclarations + ' declarations, but you gave ' + num + '.';
    assert.equal(numDeclarations, num, message);
  },

  declares: function(property, value) {
    var declaration, declarationValue;
    if (Array.isArray(value) && value.length > 1) {
      declaration = parsers.findDeclarations(this.ast, property);
      declarationValue = [];
      declaration.forEach(function(declaration){
        declarationValue.push(declaration.value);
      });
    } else {
      declaration = parsers.findDeclaration(this.ast, property);
      declarationValue = declaration ? utilities.scrubQuotes(declaration.value) : '';
    }
    var message = 'Value: ' + declarationValue + ' does not equal value: ' + value + '.';
    assert.equal(declarationValue.toString(), value.toString(), message);
  },
  
  declaresInSelector: function(selector, property, value) {
    var declaration = parsers.findDeclarationInSelector(this.ast, selector, property);
    var declarationValue = declaration ? utilities.scrubQuotes(declaration.value) : '';
    var message = 'In Selector:'+ selector + ' the value: ' + declarationValue + ' does not equal value: ' + value + '.';
    assert.equal(declarationValue, value.toString(), message);
  },

  doesNotDeclare: function(property, value) {
    var declaration = parsers.findDeclaration(this.ast, property);
    var declarationValue = declaration ? utilities.scrubQuotes(declaration.value) : '';
    var message = 'Value: ' + declarationValue + ' equals value: ' + value + '.';
    assert.notEqual(declarationValue, value.toString(), message);
  },

  equals: function(output) {
    var wrappedOutput = wrapOutput(this.type, output);
    var message = 'Mixin output is ' + this.css + ' and you gave ' + wrappedOutput + '.';
    assert.equal(this.css, wrappedOutput, message);
  },

  doesNotEqual: function(output) {
    var wrappedOutput = wrapOutput(this.type, output);
    var message = 'Mixin output equals ' + output + '.';
    assert.notEqual(this.css, wrappedOutput, message);
  },

  calls: function(mixin) {
    var mixinCss = utilities.createCss(this.file, wrapMixin(this.type, mixin));
    var message = 'Could not find the output from ' + mixin + ' in mixin.';
    assert(this.css.indexOf(unwrapOutput(this.type, mixinCss)) > -1, message);
  },

  doesNotCall: function(mixin) {
    var mixinCss = utilities.createCss(this.file, wrapMixin(this.type, mixin));
    var message = 'Mixin called ' + mixin + '.';
    assert(this.css.indexOf(unwrapOutput(this.type, mixinCss)) === -1, message);
  }
};

if (process.env.NODE_ENV === 'test') {
  MixinResult.wrapMixinWithArgs = wrapMixinWithArgs;
  MixinResult.wrapMixinWithBlock = wrapMixinWithBlock;
  MixinResult.wrapMixinWithBlockAndArgs = wrapMixinWithBlockAndArgs;
  MixinResult.wrapMixin = wrapMixin;
  MixinResult.wrapOutput = wrapOutput;
  MixinResult.unwrapOutput = unwrapOutput;
  MixinResult.compileCss = compileCss;
}

module.exports = MixinResult;
