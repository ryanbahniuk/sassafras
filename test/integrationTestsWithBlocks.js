'use strict';

var path = require('path');
var Sassaby = require('../src/sassaby');

describe('sample-with-blocks.scss', function() {
  var sassaby = new Sassaby(path.resolve(__dirname, 'fixtures/sample-with-blocks.scss'), {
    dependencies: [
      path.resolve(__dirname, 'fixtures/sample.scss')
    ]
  });

  describe('sm-specific-styles', function() {
    var block = '.test {color: red;}';
    var mixin;
    var call;

    beforeEach(function() {
      mixin = sassaby.standaloneMixin('sm-specific-styles');
      call = mixin.calledWithBlock(block);
    });

    it('should create the correct media query', function() {
      var mediaQuery = 'only screen and (min-width: 0px) and (max-width: 400px)';
      call.createsMediaQuery(mediaQuery);
    });

    it('should not create the correct media query', function() {
      var mediaQuery = 'only screen and (min-width: 0px) and (max-width: 600px)';
      call.doesNotCreateMediaQuery(mediaQuery);
    });

    it('should create the correct class', function() {
      call.createsSelector('.test');
    });

    it('should not create the correct class', function() {
      call.doesNotCreateSelector('.blah');
    });

    it('should have the correct number of declarations', function() {
      call.hasNumDeclarations(1);
    });

    it('should have the correct color declaration', function() {
      call.declares('color', 'red');
    });

    it('should have the correct total output', function() {
      var output = '@media only screen and (min-width: 0px) and (max-width: 400px) {' + block + '}';
      call.equals(output);
    });

    it('should call create-header', function() {
      var block = '@include create-header';
      mixin.calledWithBlock(block).calls('create-header');
    });
  });

  describe('make-font-face', function() {
    var block = 'font-family: Helvetica';
    var mixin;
    var call;

    beforeEach(function() {
      mixin = sassaby.standaloneMixin('make-font-face');
      call = mixin.calledWithBlock(block);
    });

    it('should create the correct media query', function() {
      var mediaQuery = 'only screen and (min-width: 0px) and (max-width: 400px)';
      call.createsMediaQuery(mediaQuery);
    });

    it('should not create the correct media query', function() {
      var mediaQuery = 'only screen and (min-width: 0px) and (max-width: 600px)';
      call.doesNotCreateMediaQuery(mediaQuery);
    });

    it('should create the correct class', function() {
      call.createsFontFace();
    });

    it('should have the correct font-family declaration', function() {
      call.declares('font-family', 'Helvetica');
    });
  });

  describe('sm-specific-styles', function() {
    var block = 'color: red;';
    var mixin;

    beforeEach(function() {
      mixin = sassaby.includedMixin('sm-specific-styles');
    });

    it('should create the correct media query', function() {
      var mediaQuery = 'only screen and (min-width: 0px) and (max-width: 400px)';
      mixin.calledWithBlock(block).createsMediaQuery(mediaQuery);
    });

    it('should have the correct color declaration', function() {
      mixin.calledWithBlock(block).declares('color', 'red');
    });
  });

  describe('make-small-color', function() {
    var block = 'width: 100%;';
    var color = 'red';
    var mixin;

    beforeEach(function() {
      mixin = sassaby.includedMixin('make-small-color');
    });

    it('should create the correct media query', function() {
      var mediaQuery = 'only screen and (min-width: 0px) and (max-width: 400px)';
      mixin.calledWithBlockAndArgs(block, color).createsMediaQuery(mediaQuery);
    });

    it('should have the correct color declaration', function() {
      mixin.calledWithBlockAndArgs(block, color).declares('color', 'red');
    });

    it('should have the correct width declaration', function() {
      mixin.calledWithBlockAndArgs(block, color).declares('width', '100%');
    });
  });
});