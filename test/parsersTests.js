'use strict';

var assert = require('assert');
var sinon = require('sinon');
var parsers = require('../src/parsers');
var ast = require('./fixtures/ast.json');
var astNoSelectors = require('./fixtures/astNoSelectors.json');
var astMediaQuery = require('./fixtures/astMediaQuery.json');
var astMediaQueryFontFace = require('./fixtures/astMediaQueryFontFace.json');

describe('Parsers', function() {
  describe('escapeCharacters', function() {
    it('should escape all special characters that can be used in a filename', function() {
      assert.equal(parsers.escapeCharacters('test/this'), 'test\/this');
      assert.equal(parsers.escapeCharacters('test.this'), 'test\.this');
      assert.equal(parsers.escapeCharacters('test*this'), 'test\*this');
      assert.equal(parsers.escapeCharacters('test?this'), 'test\?this');
      assert.equal(parsers.escapeCharacters('test(this'), 'test\(this');
      assert.equal(parsers.escapeCharacters('test)this'), 'test\)this');
      assert.equal(parsers.escapeCharacters('test{this'), 'test\{this');
      assert.equal(parsers.escapeCharacters('test}this'), 'test\}this');
    });
  });

  describe('hasSelectorValue', function() {
    var ruleWithoutSelectors = {};
    var rule = {
      type: 'rule',
      selectors: ['.test', '.second']
    };

    it('should return true if the selector is in the rule', function() {
      assert(parsers.hasSelectorValue(rule, '.test'));
      assert(parsers.hasSelectorValue(rule, '.second'));
    });

    it('should return false if the selector is not in the rule', function() {
      assert(!parsers.hasSelectorValue(rule, '.blah'));
    });

    it('should return false if the rule has no selectors', function() {
      assert(!parsers.hasSelectorValue(ruleWithoutSelectors, '.test'));
    });
  });

  describe('findDeclarationProperty', function() {
    var declaration = {
      'type': 'declaration',
      'property': 'color'
    };
    var ruleWithoutDeclarations = {
      type: 'rule',
      selectors: ['.test']
    };
    var ruleWithoutDeclaration = {
      type: 'rule',
      selectors: ['.test'],
      declarations: []
    };
    var rule = {
      type: 'rule',
      selectors: ['.test'],
      declarations: [declaration]
    };

    it('should return the declaration if it is in the rule', function() {
      assert.equal(parsers.findDeclarationProperty(rule, 'color'), declaration);
    });

    it('should return undefined if the declaration is not in the rule', function() {
      assert.equal(parsers.findDeclarationProperty(ruleWithoutDeclaration, 'color'), undefined);
    });

    it('should return undefined if the rule has no declarations', function() {
      assert.equal(parsers.findDeclarationProperty(ruleWithoutDeclarations, 'color'), undefined);
    });
  });

  describe('isFontFace', function() {
    var font = {
      type: 'font-face'
    };

    var media = {
      type: 'media'
    };

    it('should return true if the rule is a font-face type', function() {
      assert(parsers.isFontFace(font));
    });

    it('should return false if the rule is not a font-face type', function() {
      assert(!parsers.isFontFace(media));
    });
  });

  describe('countDeclarations', function() {
    it('should return the number of declarations in output', function() {
      assert.equal(parsers.countDeclarations(ast), 4);
    });

    it('should return 0 if there are no declarations', function() {
      assert.equal(parsers.countDeclarations({stylesheet: {rules: [{declarations: []}]}}), 0);
    });
  });

  describe('findDeclaration', function() {
    it('should return the declaration object if the property is found', function() {
      var declaration = {
        'type': 'declaration',
        'property': 'background-color',
        'value': 'blue',
        'position': {
          'start': {
            'line': 7,
            'column': 3
          },
          'end': {
            'line': 7,
            'column': 25
          }
        }
      };
      assert.deepEqual(parsers.findDeclaration(ast, 'background-color'), declaration);
    });

    it('should return the first declaration object if two of the property are found', function() {
      var declaration = {
        'type': 'declaration',
        'property': 'color',
        'value': 'red',
        'position': {
          'start': {
            'line': 2,
            'column': 3
          },
          'end': {
            'line': 2,
            'column': 13
          }
        }
      };
      assert.deepEqual(parsers.findDeclaration(ast, 'color'), declaration);
    });

    it('should return undefined if the declaration is not found', function() {
      assert.equal(parsers.findDeclaration(ast, 'display'), undefined);
    });
  });

  describe('findMedia', function() {
    it('should return the first rule of the type media', function() {
      var media = parsers.findMedia(astMediaQuery);
      assert.equal(media.type, 'media');
      assert.equal(media.media, 'screen and (min-width: 600px)');
    });

    it('should return undefined if there are no rules of the type media', function() {
      var media = parsers.findMedia(ast);
      assert.deepEqual(media, undefined);
    });

    it('should find the specific media query passed in', function() {
      var media = parsers.findMedia(astMediaQuery);
      assert.equal(media.type, 'media');
      assert.equal(media.media, 'screen and (min-width: 900px)');
    });
  });

  describe('hasSelector', function() {
    it('should return true if the selector is defined by itself', function() {
      assert(parsers.hasSelector(ast, '.test'));
    });

    it('should return true if the selector is defined in a list', function() {
      assert(parsers.hasSelector(ast, '.hello'));
      assert(parsers.hasSelector(ast, '.blah'));
    });

    it('should return true if the selector is defined in a media query', function() {
      assert(parsers.hasSelector(astMediaQuery, 'body'));
    });

    it('should return false if the selector not defined', function() {
      assert(!parsers.hasSelector(ast, '.not-defined'));
    });

    it('should return false if no stylesheet is defined', function() {
      assert(!parsers.hasSelector(astNoSelectors, '.test'));
    });

    it('should return false if no rules are defined', function() {
      assert(!parsers.hasSelector(astNoSelectors, '.test'));
    });
  });

  describe('hasFontFace', function() {
    it('should return true if font-face is defined', function() {
      assert(parsers.hasFontFace(astNoSelectors));
    });

    it('should return true if font-face is defined inside a media query', function() {
      assert(parsers.hasFontFace(astMediaQueryFontFace));
    });

    it('should return false if font-face not defined', function() {
      assert(!parsers.hasFontFace(ast));
    });
  });

  describe('hasImport', function() {
    var name = 'test';

    context('should return true if the import exists', function() {
      it('if it uses single quotes', function() {
        var sass = "@import '" + name + "';";
        assert(parsers.hasImport(sass, name));
      });

      it('if it is nested in a directory', function() {
        var sass = "@import 'testing/" + name + "';";
        assert(parsers.hasImport(sass, 'testing/' + name));
      });

      it('if it uses double quotes', function() {
        var sass = '@import "' + name + '";';
        assert(parsers.hasImport(sass, name));
      });

      it('if it has no space', function() {
        var sass = '@import"' + name + '";';
        assert(parsers.hasImport(sass, name));
      });

      it('if it has multiple on the same line', function() {
        var sass = '@import "hello"; @import"' + name + '";';
        assert(parsers.hasImport(sass, name));
      });

      it('if it has multiple on different lines', function() {
        var sass = '@import "hello";\n@import"' + name + '";';
        assert(parsers.hasImport(sass, name));
      });

      it('if it has multiple in a comma separated list', function() {
        var sass = '@import "hello", "' + name + '";';
        assert(parsers.hasImport(sass, name));
      });
    });

    context('should return false if the import does not exist', function() {
      var alternate = 'nope';

      it('if it uses single quotes', function() {
        var sass = "@import '" + alternate + "';";
        assert(!parsers.hasImport(sass, name));
      });

      it('if it uses double quotes', function() {
        var sass = '@import "' + alternate + '";';
        assert(!parsers.hasImport(sass, name));
      });

      it('if it has no space', function() {
        var sass = '@import"' + alternate + '";';
        assert(!parsers.hasImport(sass, name));
      });

      it('if it has multiple on the same line', function() {
        var sass = '@import "hello"; @import"' + alternate + '";';
        assert(!parsers.hasImport(sass, name));
      });

      it('if it has multiple on different lines', function() {
        var sass = '@import "hello";\n@import"' + alternate + '";';
        assert(!parsers.hasImport(sass, name));
      });

      it('if it has multiple in a comma separated list', function() {
        var sass = '@import "hello", "' + alternate + '";';
        assert(!parsers.hasImport(sass, name));
      });
    });
  });
});
