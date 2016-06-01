# Sassaby
A Unit Testing Library for SASS

<img src="/logo.png?raw=true" alt="Sassaby Logo" width="250">

Sassaby is a unit testing library for SASS mixins and functions. It is written in Node to provide a consistent interface with other front-end tests in your system and for easy integration into a build system. Its interface can be used with any Node testing library ([Mocha](https://www.npmjs.com/package/mocha "Mocha"), [Jasmine](https://www.npmjs.com/package/jasmine "Jasmine"), etc.).

## Installation

Install via npm:

 ```sh
npm install --save-dev sassaby
 ```

## Setup

Setting up Sassaby is simple with easy integration into your existing Javascript testing library. After installation, simply require it at the top of the file and instantiate a new object with the .sass or .scss file that you want to include. Here is a sample file using [Mocha](https://www.npmjs.com/package/mocha "Mocha").

```js
var path = require('path');
var Sassaby = require('sassaby');

describe('sample.scss', function() {
  var file = path.resolve(__dirname, 'sample.scss');
  var sassaby = new Sassaby(file);

  describe('appearance', function() {
    it('should have a webkit prefixed declaration', function() {
      sassaby.includedMixin('appearance').calledWith('button').declares('-webkit-appearance', 'button');
    });
  });
});
```

Note that the Sassaby constructor takes the absolute path to the SASS file. We recommend using Node's `path` and `__dirname` (which gives you the directory of the test file) plus the remaining path here. Also, note that this file must **ONLY** include SASS function and mixin declarations. Any code that compiles to CSS in this file will cause Sassaby's parsers to give inconsistent results.

## Dependencies

We recommend testing SASS files in isolation. However, depending on the setup of your SASS import tree some functions and mixins may rely on externally declared variables, mixins, or functions. In this case, you can pass an options object to the Sassaby constructor with `variables` and/or `dependencies` defined. Here is the sample file with these options:

```js
var path = require('path');
var Sassaby = require('sassaby');

describe('sample.scss', function() {
  var file = path.resolve(__dirname, 'sample.scss');
  var sassaby = new Sassaby(file, {
    variables: {
      'grid-columns': 12
    },
    dependencies: [
      path.resolve(__dirname, 'need-this-to-compile.scss')
    ]
  });

  describe('#appearance', function() {
    it('should have a webkit prefixed declaration', function() {
      sassaby.includedMixin('appearance').calledWith('button').declares('-webkit-appearance', 'button');
    });
  });
});
```

`variables` should be an object with string keys. It will declare each key-value pair as a SASS variable before compiling the given function/mixin.
`dependencies` should be an array of file paths to be imported into the compiled SASS. We recommend using the same approach (with `path` and `__dirname`) that is used with setting the file path.

## Features

Sassaby breaks down testable features into four categories:

* Functions
* Standalone Mixins
* Included Mixins

Functions are your typical SASS functions, defined like this:

```scss
@function rems($pxsize, $rembase) {
  @return ($pxsize/$rembase)+rem;
}
```

Standalone Mixins are mixins that define new rules, like this:

```scss
@mixin align-right($label) {
  .align-right-#{$label} {
    justify-content: flex-end;
  }
}
```

Included Mixins are mixins that do not define new rules, just declarations that should be placed into existing rules. For example:

```scss
@mixin appearance($value) {
  -webkit-appearance: $value;
  -moz-appearance: $value;
  appearance: $value;
}
```

Each of these categories can be defined by a respective function defined on an instance of `Sassaby`. For example, you can set up each of them with this syntax:

```js
var sassaby = new Sassaby(filePath);
var testFunction = sassaby.func('rems');
var testStandaloneMixin = sassaby.standaloneMixin('align-right');
var testIncludedMixin = sassaby.includedMixin('appearance');
```

These functions will read the given file (with variables and dependencies if given) and return an object that will takes one of the "called" functions documented below. SASS compilation will occur at this step.

### calledWithArgs
Calls the mixin or function with the given arguments.
```js
sassaby.func('rems').calledWithArgs('32px', '16px');
sassaby.standaloneMixin('align-right').calledWithArgs('md');
sassaby.includedMixin('appearance').calledWithArgs('button')
```

### called
Calls the mixin or function with no arguments.
```js
sassaby.func('rems').called();
sassaby.standaloneMixin('align-right').called();
sassaby.includedMixin('appearance').called();
```

### calledWithBlock
Calls the mixin with a block. This is only available on mixins and the block is to be given as a string without wrapping brackets.
```js
sassaby.standaloneMixin('align-right').calledWithBlock('.test { color: red; }');
sassaby.includedMixin('appearance').calledWithBlock('.test { color: red; }')
```

### calledWithBlockAndArgs
Calls the mixin with a block and arguments. This is only available on mixins and the block is to be given as a string without wrapping brackets. The block is always the first argument of this function and the mixin arguments will follow.
```js
sassaby.standaloneMixin('align-right').calledWithBlock('.test { color: red; }', true, 1);
sassaby.includedMixin('appearance').calledWithBlock('.test { color: red; }', true, 1)
```

## Rules

Each of these types has their own set of functions, or rules, that assert certain conditions on the result of the function or mixin. The arguments of these rules are normalized to match the output from the SASS compilation, so it can be formatted however you wish as long as it is compilable SASS.

### Function Rules


#### equals
Asserts that the function output equals a certain value.
```js
sassaby.func('rems').calledWithArgs('32px', '16px').equals('2rem');
```

#### doesNotEqual
Assert that the function output does not equal a certain value.
```js
sassaby.func('rems').calledWithArgs('32px', '16px').doesNotEqual('3rem');
```

#### isTrue
Assert that the function output equals true.
```js
sassaby.func('returns-true').calledWithArgs(true).isTrue();
```

#### isFalse
Assert that the function output equals false.
```js
sassaby.func('returns-false').calledWithArgs(false).isFalse();
```

#### isTruthy
Assert that the function output is a truthy value in SASS. Keep in mind that this is SASS truthy, not Javascript truthy.
```js
sassaby.func('returns-truthy').calledWithArgs('string').isTruthy();
```

#### isFalsy
Assert that the function output is a falsy value in SASS. Keep in mind that this is SASS truthy, not Javascript truthy.
```js
sassaby.func('returns-falsy').calledWithArgs(null).isFalsy();
```


### Standalone Mixin Rules


#### createsSelector
Assert that the mixin creates the given selector.
```js
sassaby.standaloneMixin('align-right').calledWithArgs('md').createsSelector('.align-right-md');
```

#### doesNotCreateSelector
Assert that the mixin does not create the given selector.
```js
sassaby.standaloneMixin('align-right').calledWithArgs('md').doesNotCreateSelector('.align-right-lg');
```

#### createsMediaQuery
Assert that the mixin creates a media query with the given string.
```js
sassaby.standaloneMixin('make-button').calledWithArgs('200px').createsMediaQuery('screen and (max-width: 200px)');
```

#### doesNotCreateMediaQuery
Assert that the mixin does not create a media query with the given string.
```js
sassaby.standaloneMixin('make-button').calledWithArgs('200px').doesNotCreateMediaQuery('screen and (max-width: 400px)');
```

#### createsFontFace
Assert that the mixin creates a font-face rule.
```js
sassaby.standaloneMixin('make-font-face').calledWithArgs('helvetica').createsFontFace();
```

#### doesNotCreateFontFace
Assert that the mixin does not create a font-face rule.
```js
sassaby.standaloneMixin('align-right').calledWithArgs('md').doesNotCreateFontFace();
```

#### hasNumDeclarations
Assert that the mixin creates the given number of declarations.
```js
sassaby.standaloneMixin('align-right').calledWithArgs('md').hasNumDeclarations(1);
```

#### declares
Assert that the mixin makes a declaration of the given rule-property pair.
```js
sassaby.standaloneMixin('align-right').calledWithArgs('md').declares('justify-content', 'flex-end');
```

#### doesNotDeclare
Assert that the mixin does not make a declaration of the given rule-property pair.
```js
sassaby.standaloneMixin('align-right').calledWithArgs('md').doesNotDeclare('text-align', 'right');
```

#### equals
Assert that the mixin output equals the given string.
```js
sassaby.standaloneMixin('align-right').calledWithArgs('md').equals('.align-right-md { justify-content: flex-end; }');
```

#### doesNotEqual
Assert that the mixin output does not equal the given string.
```js
sassaby.standaloneMixin('align-right').calledWithArgs('md').doesNotEqual('.align-right-lg { justify-content: flex-end; }');
```

#### calls
Assert that the mixin calls another mixin.
```js
sassaby.standaloneMixin('build-alignments').calledWithArgs('md').calls('align-right(md)');
```

#### doesNotCall
Assert that the mixin does not call another mixin.
```js
sassaby.standaloneMixin('build-alignments').calledWithArgs('md').doesNotCall('align-right(lg)');
```


### Included Mixin Rules


#### hasNumDeclarations
Assert that the mixin creates the given number of declarations.
```js
sassaby.includedMixin('appearance').calledWithArgs('button').hasNumDeclarations(3);
```

#### declares
Assert that the mixin makes a declaration of the given rule-property pair.
```js
sassaby.includedMixin('appearance').calledWithArgs('button').declares('-webkit-appearance', 'button');
```

#### declaresProperties
Assert that the mixin makes a declaration of the given property with fallback values.
E.g. for the mixin: 
```
@mixin font-size($font-size: 1.6) {
    font-size: $font-size * 16 + px;
    font-size: $font-size + rem;
}
```
```js
sassaby.includedMixin('font-size').calledWithArgs('2').declaresProperties('max-height', ['32px', '2rem']);
```

#### declaresInSelector
Assert that the mixin makes a declaration of the given rule-property pair inside the provided selector.
E.g. for the mixin: 
```
@mixin clearfix() {
  &:before,
  &:after {
    content: " "; // 1
    display: table; // 2
  }
  &:after {
    clear: both;
  }
}
```
```js
sassaby.includedMixin('clearfix').called().declaresInSelector(':before', 'content', " ");
sassaby.includedMixin('clearfix').called().declaresInSelector(':before', 'display', 'table');
sassaby.includedMixin('clearfix').called().declaresInSelector(':after', 'content', " ");
sassaby.includedMixin('clearfix').called().declaresInSelector(':after', 'display', 'table');
sassaby.includedMixin('clearfix').called().declaresInSelector(':after', 'clear', 'both');
```

#### doesNotDeclare
Assert that the mixin does not make a declaration of the given rule-property pair.
```js
sassaby.includedMixin('appearance').calledWithArgs('button').doesNotDeclare('-o-appearance', 'button');
```

#### equals
Assert that the mixin output equals the given string.
```js
sassaby.includedMixin('appearance').calledWithArgs('button').equals('-webkit-appearance: button; -moz-appearance: button; appearance: button;');
```

#### doesNotEqual
Assert that the mixin output does not equal the given string.
```js
sassaby.includedMixin('appearance').calledWithArgs('button').doesNotEqual('appearance: button;');
```

#### calls
Assert that the mixin calls another mixin.
```js
sassaby.includedMixin('appearance').calledWithArgs('button').calls('prefixer(button)');
```

#### doesNotCall
Assert that the mixin does not call another mixin.
```js
sassaby.includedMixin('appearance').calledWithArgs('button').doesNotCall('prefixer(-webkit-button)');
```


### Testing Imports

Often your SASS project will have a single entry point from where all other files are imported. Sassaby exposes two assertion methods on the sassaby object itself to test this. These two methods take the same path that would be included in the `@import` statement in your SASS file.


#### imports
Assert that the file imports the given path.
```js
sassaby.imports('variables');
```

#### doesNotImport
Assert that the file does not import the given path.
```js
sassaby.imports('nope');
```

## Contributing

Pull requests are welcome. If you add functionality, then please add unit tests
to cover it. Continuous Integration is handled by [Travis](https://travis-ci.org/ryanbahniuk/sassaby "Travis").

## License

MIT © Ryan Bahniuk

[ci]:      https://travis-ci.org/ryanbahniuk/sassaby
[npm]:     https://www.npmjs.com/package/sassaby
