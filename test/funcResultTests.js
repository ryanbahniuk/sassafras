'use strict';

var assert = require('assert');
var sinon = require('sinon');
var proxyquire =  require('proxyquire');
var utilities = require('../src/utilities');

describe('FuncResult', function() {
  var FuncResult;
  var funcResult;
  var funcTrueResult;
  var funcFalseResult;
  var mockUtilities;
  var args = [5];
  var file = '@function test($input) { @return 2 * $input };.foo{display:"block";}';
  var call = 'test';
  var argString = '5';
  var result = '10';
  var wrappedResult = '.foo{display:"block";}.test{content:' + result + '}';
  var wrappedTrueResult = '.foo{display:"block";}.test{content:true}';
  var wrappedFalseResult = '.foo{display:"block";}.test{content:false}';

  beforeEach(function() {
    FuncResult = proxyquire('../src/funcResult', {
      './utilities': utilities
    });

    mockUtilities = sinon.mock(utilities);

    mockUtilities.expects('createCss').withArgs(file, FuncResult.wrapFunctionWithArgs(call, args)).returns(wrappedResult);
    mockUtilities.expects('createCss').withArgs(file, FuncResult.wrapTruthyFunctionWithArgs(call, args)).returns(wrappedTrueResult);
    funcResult = new FuncResult(file, call, args);
    mockUtilities.expects('createCss').withArgs(file, FuncResult.wrapFunctionWithArgs(call, args)).returns(wrappedTrueResult);
    mockUtilities.expects('createCss').withArgs(file, FuncResult.wrapTruthyFunctionWithArgs(call, args)).returns(wrappedTrueResult);
    funcTrueResult = new FuncResult(file, call, args);
    mockUtilities.expects('createCss').withArgs(file, FuncResult.wrapFunctionWithArgs(call, args)).returns(wrappedFalseResult);
    mockUtilities.expects('createCss').withArgs(file, FuncResult.wrapTruthyFunctionWithArgs(call, args)).returns(wrappedFalseResult);
    funcFalseResult = new FuncResult(file, call, args);
  });

  afterEach(function() {
    mockUtilities.restore();
  });

  describe('wrapFunctionWithArgs', function() {
    it('wraps the function and args with the necessary SCSS to not fail the compiler', function() {
      mockUtilities.expects('concatArgs').withArgs(args).returns(argString);
      assert.equal(FuncResult.wrapFunctionWithArgs(call, args), '.test{content:' + call + '(' + argString + ')}');
    });
  });

  describe('wrapTruthyFunctionWithArgs', function() {
    it('wraps the function and truthy with the necessary SCSS to not fail the compiler', function() {
      mockUtilities.expects('concatArgs').withArgs(args).returns(argString);
      assert.equal(FuncResult.wrapTruthyFunctionWithArgs(call, args), FuncResult.sassTruthy() + FuncResult.wrapFunction("truthy(" + call + '(' + argString + '))'));
    });
  });

  describe('wrapTruthyFunction', function() {
    it('wraps the function and truthy with the necessary SCSS to not fail the compiler', function() {
      assert.equal(FuncResult.wrapTruthyFunction(call), FuncResult.sassTruthy() + FuncResult.wrapFunction("truthy(" + call + ')'));
    });
  });

  describe('wrapFunction', function() {
    it('wraps the function with the necessary SCSS to not fail the compiler', function() {
      assert.equal(FuncResult.wrapFunction(call), '.test{content:' + call + '}');
    });
  });

  describe('sassTruthy', function() {
    it('returns the sass truthy function as a string', function() {
      assert.equal(FuncResult.sassTruthy(), '@function truthy($value) { @if $value { @return true } @else { @return false } }');
    });
  });

  describe('compileCss', function() {
    context('if given an argument array with items', function() {
      it('calls utilities.createCss with wrapFunctionWithArgs', function() {
        var wrapped = FuncResult.wrapFunctionWithArgs(call, args);
        mockUtilities.expects('createCss').withArgs(file, wrapped).returns(wrappedResult);
        assert.equal(FuncResult.compileCss(file, call, args), wrappedResult);
      });
    });

    context('if given an empty argument array', function() {
      it('calls utilities.createCss with wrapFunction', function() {
        var wrapped = FuncResult.wrapFunction(call);
        mockUtilities.expects('createCss').withArgs(file, wrapped).returns(wrappedResult);
        assert.equal(FuncResult.compileCss(file, call, []), wrappedResult);
      });
    });

    context('if given an null for arguments', function() {
      it('calls utilities.createCss with wrapFunction', function() {
        var wrapped = FuncResult.wrapFunction(call);
        mockUtilities.expects('createCss').withArgs(file, wrapped).returns(wrappedResult);
        assert.equal(FuncResult.compileCss(file, call, null), wrappedResult);
      });
    });

    context('if given an undefined for arguments', function() {
      it('calls utilities.createCss with wrapFunction', function() {
        var wrapped = FuncResult.wrapFunction(call);
        mockUtilities.expects('createCss').withArgs(file, wrapped).returns(wrappedResult);
        assert.equal(FuncResult.compileCss(file, call, undefined), wrappedResult);
      });
    });
  });

describe('compileTruthyCss', function() {
    context('if given an argument array with items', function() {
      it('calls utilities.createCss with wrapFunctionWithArgs', function() {
        var wrapped = FuncResult.wrapTruthyFunctionWithArgs(call, args);
        mockUtilities.expects('createCss').withArgs(file, wrapped).returns(wrappedTrueResult);
        assert.equal(FuncResult.compileTruthyCss(file, call, args), wrappedTrueResult);
      });
    });

    context('if given an empty argument array', function() {
      it('calls utilities.createCss with wrapFunction', function() {
        var wrapped = FuncResult.wrapTruthyFunction(call);
        mockUtilities.expects('createCss').withArgs(file, wrapped).returns(wrappedTrueResult);
        assert.equal(FuncResult.compileTruthyCss(file, call, []), wrappedTrueResult);
      });
    });

    context('if given an null for arguments', function() {
      it('calls utilities.createCss with wrapFunction', function() {
        var wrapped = FuncResult.wrapTruthyFunction(call);
        mockUtilities.expects('createCss').withArgs(file, wrapped).returns(wrappedTrueResult);
        assert.equal(FuncResult.compileTruthyCss(file, call, null), wrappedTrueResult);
      });
    });

    context('if given an undefined for arguments', function() {
      it('calls utilities.createCss with wrapFunction', function() {
        var wrapped = FuncResult.wrapTruthyFunction(call);
        mockUtilities.expects('createCss').withArgs(file, wrapped).returns(wrappedTrueResult);
        assert.equal(FuncResult.compileTruthyCss(file, call, undefined), wrappedTrueResult);
      });
    });
  });

  describe('new', function() {
    beforeEach(function() {
      mockUtilities.expects('createCss').withArgs(file, FuncResult.wrapFunctionWithArgs(call, args)).returns(wrappedResult);
      mockUtilities.expects('createCss').withArgs(file, FuncResult.wrapTruthyFunctionWithArgs(call, args)).returns(wrappedTrueResult);
      sinon.spy(FuncResult, 'compileCss');
      sinon.spy(FuncResult, 'compileTruthyCss');
      funcResult = new FuncResult(file, call, args);
      FuncResult.compileCss.calledWith(file, call, args);
      FuncResult.compileTruthyCss.calledWith(file, call, args);
    });

    afterEach(function() {
      FuncResult.compileCss.restore();
      FuncResult.compileTruthyCss.restore();
    });

    it('should set file and call from the arguments', function() {
      assert.equal(funcResult.css, wrappedResult);
      assert.equal(funcResult.truthyCss, wrappedTrueResult);
    });
  });

  describe('equals', function() {
    it('should not throw an error if the output matches the input', function() {
      funcResult.equals(result);
    });

    it('throws an error if the output does not match the input', function() {
      assert.throws(function() { funcResult.equals(20); });
    });
  });

  describe('doesNotEqual', function() {
    it('should not throw an error if the output does not match the input', function() {
      funcResult.doesNotEqual(20);
    });

    it('throws an error if the output does input', function() {
      assert.throws(function() {
        funcResult.doesNotEqual(result);
      });
    });
  });

  describe('isTrue', function() {
    it('should not throw an error if the output is true', function() {
      funcTrueResult.isTrue();
    });

    it('throws an error if the output is not true', function() {
      assert.throws(function() {
        funcFalseResult.isTrue();
      });
    });
  });

  describe('isFalse', function() {
    it('should not throw an error if the output is false', function() {
      funcFalseResult.isFalse();
    });

    it('throws an error if the output is not false', function() {
      assert.throws(function() {
        funcTrueResult.isFalse();
      });
    });
  });

  describe('isTruthy', function() {
    it('should not throw an error if the output is truthy', function() {
      funcTrueResult.isTruthy();
    });

    it('throws an error if the output is not truthy', function() {
      assert.throws(function() {
        funcFalseResult.isTruthy();
      });
    });
  });

  describe('isFalsy', function() {
    it('should not throw an error if the output is falsy', function() {
      funcFalseResult.isFalsy();
    });

    it('throws an error if the output is not falsy', function() {
      assert.throws(function() {
        funcTrueResult.isFalsy();
      });
    });
  });
});
