'use strict';

function escapeCharacters(string) {
  var specials = ['/', '.', '*', '+', '?', '(', ')', '[', ']', '{', '}'];
  var pattern = '([' + specials.join('') + '])';
  var re = new RegExp(pattern, 'g');
  return string.replace(re, '\\$1');
}

function hasSelectorValue(rule, selectorValue) {
  var found = false;

  if (rule.selectors) {
    rule.selectors.forEach(function(selector) {
      if (selector === selectorValue) {
        found = true;
      }
    });
  }

  return found;
}

function findDeclarationProperty(rule, declarationProperty) {
  var foundDeclaration;
  if (rule.declarations) {
    rule.declarations.forEach(function(declaration) {
      if (declaration.property === declarationProperty) {
        foundDeclaration = declaration;
      }
    });
  }
  return foundDeclaration;
}

function findDeclarationsProperties(rule, declarationProperty) {
  var foundDeclarations = [];
  if (rule.declarations) {
    rule.declarations.forEach(function(declaration) {
      if (declaration.property === declarationProperty) {
        foundDeclarations.push(declaration);
      }
    });
  }
  return foundDeclarations;
}

function isFontFace(rule) {
  if (rule.type === 'font-face') {
    return true;
  }
  return false;
}

var Parsers = {
  countDeclarations: function(ast) {
    var count = 0;

    ast.stylesheet.rules.forEach(function(rule) {
      if (rule.type === 'media') {
        rule.rules.forEach(function(rule) {
          count = count + rule.declarations.length;
        });
      } else {
        count = count + rule.declarations.length;
      }
    });
    return count;
  },
  findDeclaration: function(ast, property) {
    var found;
    ast.stylesheet.rules.forEach(function(rule) {
      if (rule.type === 'media') {
        rule.rules.forEach(function(rule) {
          found = found || findDeclarationProperty(rule, property);
        });
      } else {
        found = found || findDeclarationProperty(rule, property);
      }
    });

    return found;
  },

  findDeclarations: function(ast, property) {
    var found = [];
    ast.stylesheet.rules.forEach(function(rule) {
      if (rule.type === 'media') {
        rule.rules.forEach(function(rule) {
          found.push(findDeclarationsProperties(rule, property));         
        });
      } else {
        found.push(findDeclarationsProperties(rule, property));
      }
    });
    var declarationsArray;
    found.forEach(function(value) {
      if(value.length !== 0) {
        declarationsArray = value;
      }
    })
    return declarationsArray;
  },

  findDeclarationInSelector: function(ast, selector, property) {
    var found;
    if (selector.indexOf("&") > -1) {
       selector = selector.replace("&", ".test");
    }
    if (selector.indexOf("@at-root") > -1) {
      selector = selector.replace("@at-root ", "");
    }
    ast.stylesheet.rules.forEach(function(rule) {
      for(var i = 0; i < rule.selectors.length; i++) {
        if(rule.selectors[i].indexOf(selector) >= 0 ) {
          found = found || findDeclarationProperty(rule, property);
        }
      }
    });
    console.log(found);
    return found;
  },

  findMedia: function(ast) {
    var found = [];

    ast.stylesheet.rules.forEach(function(rule) {
      if (rule.type === 'media') {
        found.push(rule);
      }
    });

    return found[0];
  },

  hasSelector: function(ast, selectorValue) {
    var found = false;

    ast.stylesheet.rules.forEach(function(rule) {
      if (rule.type === 'media') {
        rule.rules.forEach(function(rule) {
          found = found || hasSelectorValue(rule, selectorValue);
        });
      } else {
        found = found || hasSelectorValue(rule, selectorValue);
      }
    });

    return found;
  },

  hasFontFace: function(ast) {
    var found = false;

    ast.stylesheet.rules.forEach(function(rule) {
      if (rule.type === 'media') {
        rule.rules.forEach(function(rule) {
          found = found || isFontFace(rule);
        });
      } else {
        found = found || isFontFace(rule);
      }
    });

    return found;
  },

  hasImport: function(sass, importName) {
    var pattern = new RegExp('@import[^;]*[\'\"]' + escapeCharacters(importName) + '[\'\"].*;');
    return !!sass.match(pattern);
  }
};

if (process.env.NODE_ENV === 'test') {
  Parsers.escapeCharacters = escapeCharacters;
  Parsers.hasSelectorValue = hasSelectorValue;
  Parsers.findDeclarationProperty = findDeclarationProperty;
  Parsers.isFontFace = isFontFace;
}

module.exports = Parsers;
