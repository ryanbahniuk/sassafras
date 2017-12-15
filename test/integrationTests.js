'use strict';

var path = require('path');
var Sassaby = require('../src/sassaby');

describe('sample.scss', function() {
  var sassaby = new Sassaby(path.resolve(__dirname, 'fixtures/sample.scss'));
  var mixin;
  var compiled;

  describe('appearance', function() {
    beforeEach(function() {
      mixin = sassaby.includedMixin('appearance');
    });

    it('should return 3 declarations', function() {
      mixin.calledWithArgs('button').hasNumDeclarations(3);
    });

    it('should have a webkit prefixed declaration', function() {
      mixin.calledWithArgs('button').declares('-webkit-appearance', 'button');
    });

    it('should not make an incorrect declaration', function() {
      mixin.calledWithArgs('button').doesNotDeclare('-webkit-appearance', 'none');
      mixin.calledWithArgs('button').doesNotDeclare('color', 'red');
    });

    it('should have the correct entire output', function() {
      mixin.calledWithArgs('button').equals('-webkit-appearance: button; -moz-appearance: button; appearance: button;');
    });

    it('should not equal the incorrect output', function() {
      mixin.calledWithArgs('button').doesNotEqual('-moz-appearance: button; appearance: button;');
    });
  });

  describe('make-column', function() {
    beforeEach(function() {
      mixin = sassaby.standaloneMixin('make-column');
    });

    it('should define the correct class', function() {
      mixin.calledWithArgs('md', 6).createsSelector('.col-md-6');
    });

    it('should not define the incorrect class', function() {
      mixin.calledWithArgs('md', 6).doesNotCreateSelector('.col-lg-6');
    });

    it('should return 2 declarations', function() {
      mixin.calledWithArgs('md', 6).hasNumDeclarations(2);
    });

    it('should declare the correct width', function() {
      mixin.calledWithArgs('md', 6).declares('max-width', '50%');
    });

    it('should not declare the incorrect width', function() {
      mixin.calledWithArgs('md', 6).doesNotDeclare('max-width', '60%');
      mixin.calledWithArgs('md', 6).doesNotDeclare('appearance', 'button');
    });

    it('should have the correct entire output', function() {
      mixin.calledWithArgs('md', 6).equals('.col-md-6 { flex-basis: 50%; max-width: 50%; }');
    });

    it('should not have incorrect output', function() {
      mixin.calledWithArgs('md', 6).doesNotEqual('.col-md-8 { flex-basis: 50%; max-width: 50%; }');
    });
  });

  describe('make-sized-button', function() {
    beforeEach(function() {
      mixin = sassaby.standaloneMixin('make-sized-button');
      compiled = mixin.calledWithArgs('red', '200px');
    });

    it('should create the correct media query', function() {
      compiled.createsMediaQuery('screen and (max-width: 200px)');
    });

    it('should not create the incorrect media query', function() {
      compiled.doesNotCreateMediaQuery('screen and (max-width: 400px)');
    });

    it('should create the button class', function() {
      compiled.createsSelector('.button');
    });

    it('should declare the correct background-color', function() {
      compiled.declares('background-color', 'red');
    });
  });

  describe('remy', function() {
    it('convert to px units to rem units', function() {
      sassaby.func('remy').calledWithArgs('32px', '16px').equals('2rem');
    });

    it('has the correct output unit', function() {
      sassaby.func('remy').calledWithArgs('32px', '16px').doesNotEqual('2em');
    });
  });

  describe('boolean-switch', function() {
    it('should return true if passed true', function() {
      sassaby.func('boolean-switch').calledWithArgs(true).isTrue();
    });

    it('should return false if passed false', function() {
      sassaby.func('boolean-switch').calledWithArgs(false).isFalse();
    });
  });

  describe('return-self', function() {
    it('testing truthy', function() {
      sassaby.func('return-self').calledWithArgs(true).isTruthy();
      sassaby.func('return-self').calledWithArgs(1).isTruthy();
      sassaby.func('return-self').calledWithArgs('a').isTruthy();
    });

    it('testing falsy', function() {
      sassaby.func('return-self').calledWithArgs(false).isFalsy();
      sassaby.func('return-self').calledWithArgs(null).isFalsy();
    });
  });

  describe('make-general-alignments', function() {
    beforeEach(function() {
      mixin = sassaby.standaloneMixin('make-general-alignments');
    });

    it('should call the correct mixins', function() {
      mixin.calledWithArgs('md').calls('make-align-left(md)');
      mixin.calledWithArgs('md').calls('make-align-center(md)');
      mixin.calledWithArgs('md').calls('make-align-right(md)');
    });

    it('should not call the incorrect mixin', function() {
      mixin.calledWithArgs('md').doesNotCall('make-align-left(lg)');
    });
  });

  describe('test-included-mixin-include', function() {
    beforeEach(function() {
      mixin = sassaby.standaloneMixin('test-included-mixin-include');
      compiled = mixin.called();
    });

    it('should create the correct selector', function() {
      compiled.createsSelector('.test');
    });

    it('should call the correct mixin', function() {
      compiled.calls('appearance(none)', 'included');
    });
  });

  describe('animation', function() {
    beforeEach(function() {
      mixin = sassaby.includedMixin('animation');
    });

    it('should have the correct output', function() {
      mixin.calledWithArgs('test', 500).declares('animation-name', 'test');
      mixin.calledWithArgs('test', 500).declares('animation-duration', 500);
    });

    it('should call the correct mixins', function() {
      mixin.calledWithArgs('test', 500).calls('prefixer(webkit, animation-name, test)');
      mixin.calledWithArgs('test', 500).calls('prefixer(moz, animation-name, test)');
      mixin.calledWithArgs('test', 500).calls('prefixer(webkit, animation-duration, 500)');
      mixin.calledWithArgs('test', 500).calls('prefixer(moz, animation-duration, 500)');
    });

    it('should not call the incorrect mixins', function() {
      mixin.calledWithArgs('test', 500).doesNotCall('prefixer(o, animation-name, test)');
    });
  });

  describe('create-header', function() {
    beforeEach(function() {
      mixin = sassaby.standaloneMixin('create-header');
    });

    it('should have the correct output', function() {
      mixin.called().declares('width', '100%');
    });

    it('should create a header selector', function() {
      mixin.called().createsSelector('header');
    });
  });

  describe('color-red', function() {
    beforeEach(function() {
      mixin = sassaby.includedMixin('color-red');
    });

    it('should have the correct output', function() {
      mixin.called().declares('color', 'red');
    });
  });

  describe('small-screen-header', function() {
    var mediaQuery = 'only screen and (min-width: 0px) and (max-width: 400px)';

    beforeEach(function() {
      mixin = sassaby.standaloneMixin('small-screen-header');
    });

    it('should create a media query', function() {
      mixin.called().createsMediaQuery(mediaQuery);
    });

    it('should call create-header', function() {
      mixin.called().calls('create-header');
    });
  });
});
