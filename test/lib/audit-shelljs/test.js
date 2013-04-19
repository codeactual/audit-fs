/*jshint expr:true*/
var sinon = require('sinon');
var chai = require('chai');
var fs = require('fs');
var util = require('util');
var sprintf = util.format;

var should = chai.should();
chai.Assertion.includeStack = true;
chai.use(require('sinon-chai'));

var auditShelljs = require('../../..');
var AuditShelljs = auditShelljs.AuditShelljs;

require('sinon-doublist')(sinon, 'mocha');

describe('AuditShelljs', function() {
  'use strict';

  beforeEach(function() {
    this.ruleArgs = ['rule test configs'];
    this.ruleFn = {iAmA: 'rule function'};
    this.ruleName = 'hasSomething';
    this.testRes = {iAmA: 'test result'};
    this.dir = 'dir';
    this.file = 'file.ext';
    this.as = new auditShelljs.create();
    this.resOK = {code: 0};
    this.hasDirSpy = this.spy(auditShelljs.rules, 'hasDir');
    this.hasFileStub = this.stub(auditShelljs.rules, 'hasFile');
  });

  describe('constructor', function() {
    it('should use cwd as default target dir', function() {
      this.as = new auditShelljs.create();
      this.as.get('dir').should.equal(process.cwd());
    });
  });

  describe('prototype', function() {
    it('should include generated rules', function() {
      var self = this;
      Object.keys(auditShelljs.rules).forEach(function(name) {
        self.as[name].should.be.a('function');
      });
    });
  });

  describe('.createQueuePush', function() {
    it('should create a function that queues configured rule test', function() {
      var pushTestSpy = this.spy();
      var context = {tests: {push: pushTestSpy}};
      var created = AuditShelljs.createQueuePush(this.ruleName, this.ruleFn);
      created.apply(context, this.ruleArgs).should.deep.equal(context);
      pushTestSpy.should.have.been.calledWithExactly({
        name: this.ruleName, cb: this.ruleFn, args: this.ruleArgs
      });
    });
  });

  describe('generated test wrapper', function() {
    it('should skip current test if a past test failed', function() {
      this.hasFileStub.withArgs(this.file).returns(false);
      this.as.hasFile(this.file).hasDir(this.dir).hit();
      this.hasFileStub.should.have.been.called;
      this.hasDirSpy.should.not.have.been.calledWith(this.dir);
    });

    it('should pass-through all args', function() {
      var customStub = this.stub(auditShelljs.rules, 'custom');
      this.as.custom('foo', 'bar', 'baz').hit();
      customStub.should.have.been.calledWithExactly('foo', 'bar', 'baz');
    });

    it('should save results', function() {
      this.hasFileStub.withArgs(this.file).returns(this.testRes);
      this.as.hasFile(this.file).hit();
      this.as.results.length.should.equal(1);
      this.as.results[0].name.should.equal('hasFile');
      this.as.results[0].res.should.deep.equal(this.testRes);
      this.as.results[0].args.should.deep.equal([this.file]);
    });

    it('should not change match status on hit', function() {
      this.hasFileStub.withArgs(this.file).returns(true);
      this.as.match.should.equal(true);
      this.as.hasFile(this.file).hit();
      this.as.match.should.equal(true);
    });

    it('should correctly update match status on miss', function() {
      this.hasFileStub.withArgs(this.file).returns(false);
      this.as.match.should.equal(true);
      this.as.hasFile(this.file).hit();
      this.as.match.should.equal(false);
    });
  });

  describe('#hit', function() {
    it('should begin commands from target dir', function() {
      this.as.set('dir', this.dir);
      var stub = this.stub(this.as.shelljs, '_');
      this.as.hit();
      stub.should.have.been.calledWith('cd', this.dir);
    });

    it('should return match result', function() {
      this.as.hit().should.equal(true);

      this.hasFileStub.withArgs(this.file).returns(false);
      this.as.hasFile(this.file).hit().should.equal(false);
    });
  });

  describe('#last', function() {
    it('should return last test result', function() {
      this.hasFileStub.withArgs(this.file).returns(false);
      this.as.hasDir('').hasFile(this.file).hit();
      this.as.last().should.deep.equal({
        name: 'hasFile', args: [this.file], res: false
      });
    });
  });

  describe('test', function() {
    beforeEach(function() {
      this.stub = this.stub(this.as.shelljs, '_');
    });

    describe('#custom', function() {
      it('should return shelljs pass-through result', function() {
        this.as.custom('test', '-L', this.file).hit();
        this.stub.should.have.been.calledWithExactly('test', '-L', this.file);
      });
    });

    describe('#grep', function() {
      it('should return shelljs pass-through result', function() {
        this.as.grep('textRegex', 'fileRegex').hit();
        this.stub.should.have.been.calledWithExactly('grep', 'textRegex', 'fileRegex');
      });
    });

    describe('#grepv', function() {
      it('should return shelljs pass-through result', function() {
        this.as.grepv('textRegex', 'fileRegex').hit();
        this.stub.should.have.been.calledWithExactly('grep', '-v', 'textRegex', 'fileRegex');
      });
    });

    describe('#hasDir', function() {
      it('should return shelljs pass-through result', function() {
        this.as.hasDir('').hit();
        this.stub.should.have.been.calledWithExactly('test', '-d', process.cwd() + '/');
      });
    });

    describe('#hasFile', function() {
      it('should return shelljs pass-through result', function() {
        this.hasFileStub.restore();
        this.as.hasFile(this.file).hit();
        this.stub.should.have.been.calledWithExactly(
          'test', '-f', process.cwd() + '/' + this.file
        );
      });
    });
  });
});
