/*jshint expr:true*/
var sinon = require('sinon');
var chai = require('chai');
var fs = require('fs');
var util = require('util');
var sprintf = util.format;

var should = chai.should();
chai.Assertion.includeStack = true;
chai.use(require('sinon-chai'));

var auditFs = require('../../..');
var AuditFs = auditFs.AuditFs;

require('sinon-doublist')(sinon, 'mocha');

describe('AuditFs', function() {
  'use strict';

  beforeEach(function() {
    this.ruleArgs = ['rule test configs'];
    this.ruleFn = {iAmA: 'rule function'};
    this.ruleName = 'hasSomething';
    this.testRes = {iAmA: 'test result'};
    this.dir = 'dir';
    this.file = 'file.ext';
    this.as = new auditFs.create();
    this.resOK = {code: 0};
    this.hasDirSpy = this.spy(auditFs.rules, 'hasDir');
    this.hasFileStub = this.stub(auditFs.rules, 'hasFile');
  });

  describe('constructor', function() {
    it('should use cwd as default target dir', function() {
      this.as = new auditFs.create();
      this.as.get('dir').should.equal(process.cwd());
    });
  });

  describe('prototype', function() {
    it('should include generated rules', function() {
      var self = this;
      Object.keys(auditFs.rules).forEach(function(name) {
        self.as[name].should.be.a('function');
      });
    });
  });

  describe('.createQueuePush', function() {
    it('should create a function that queues configured rule test', function() {
      var pushTestSpy = this.spy();
      var context = {tests: {push: pushTestSpy}};
      var created = AuditFs.createQueuePush(this.ruleName, this.ruleFn);
      created.apply(context, this.ruleArgs).should.deep.equal(context);
      pushTestSpy.should.have.been.calledWithExactly({
        name: this.ruleName, cb: this.ruleFn, args: this.ruleArgs
      });
    });
  });

  describe('generated test wrapper', function() {
    it('should skip current test if a past test failed', function() {
      this.hasFileStub.withArgs(this.file).returns(false);
      this.as.hasFile(this.file).hasDir(this.dir).pass();
      this.hasFileStub.should.have.been.called;
      this.hasDirSpy.should.not.have.been.calledWith(this.dir);
    });

    it('should pass-through all args', function() {
      var _Stub = this.stub(auditFs.rules, '_');
      this.as._('foo', 'bar', 'baz').pass();
      _Stub.should.have.been.calledWithExactly('foo', 'bar', 'baz');
    });

    it('should save results', function() {
      this.hasFileStub.withArgs(this.file).returns(this.testRes);
      this.as.hasFile(this.file).pass();
      this.as.results.length.should.equal(1);
      this.as.results[0].name.should.equal('hasFile');
      this.as.results[0].res.should.deep.equal(this.testRes);
      this.as.results[0].args.should.deep.equal([this.file]);
    });

    it('should not change match status on pass', function() {
      this.hasFileStub.withArgs(this.file).returns(true);
      this.as.match.should.equal(true);
      this.as.hasFile(this.file).pass();
      this.as.match.should.equal(true);
    });

    it('should correctly update match status on miss', function() {
      this.hasFileStub.withArgs(this.file).returns(false);
      this.as.match.should.equal(true);
      this.as.hasFile(this.file).pass();
      this.as.match.should.equal(false);
    });
  });

  describe('#pass', function() {
    it('should begin commands from target dir', function() {
      this.as.set('dir', this.dir);
      var stub = this.stub(this.as.shelljs, '_');
      this.as.pass();
      stub.should.have.been.calledWith('cd', this.dir);
    });

    it('should return match result', function() {
      this.as.pass().should.equal(true);

      this.hasFileStub.withArgs(this.file).returns(false);
      this.as.hasFile(this.file).pass().should.equal(false);
    });
  });

  describe('#last', function() {
    it('should return last test result', function() {
      this.hasFileStub.withArgs(this.file).returns(false);
      this.as.hasDir('').hasFile(this.file).pass();
      this.as.last().should.deep.equal({
        name: 'hasFile', args: [this.file], res: false
      });
    });
  });

  describe('test', function() {
    beforeEach(function() {
      this._Stub = this.stub(this.as.shelljs, '_');
    });

    describe('#_', function() {
      it('should return shelljs pass-through result', function() {
        this.as._('test', '-L', this.file).pass();
        this._Stub.should.have.been.calledWithExactly('test', '-L', this.file);
      });
    });

    describe('#__', function() {
      it('should return outer-shelljs pass-through result', function() {
        var stub = this.stub(this.as.shelljs, 'grep');
        this.as.__('grep', 'needle', '/path/to/haystack').pass();
        stub.should.have.been.calledWithExactly('needle', '/path/to/haystack');
      });
    });

    describe('#assert', function() {
      it('should receive OuterShelljs instance', function() {
        var cb = this.stub();
        this.as.assert('some expectation', cb).pass();
        cb.should.have.been.calledWithExactly(this.as.shelljs);
      });

      it('should return custom function pass', function() {
        var cb = this.stub();
        cb.returns(false);
        this.as.assert('some expectation', cb).pass().should.equal(false);
        cb.should.have.been.called;
      });

      it('should return custom function fail', function() {
        var cb = this.stub();
        cb.returns(true);
        this.as.assert('some expectation', cb).pass().should.equal(true);
        cb.should.have.been.called;
      });
    });

    describe('#refute', function() {
      describe('function', function() {
        it('should receive OuterShelljs instance', function() {
          var cb = this.stub();
          this.as.refute('some expectation', cb).pass();
          cb.should.have.been.calledWithExactly(this.as.shelljs);
        });

        it('should return custom function pass', function() {
          var cb = this.stub();
          cb.returns(true);
          this.as.refute('some expectation', cb).pass().should.equal(false);
          cb.should.have.been.called;
        });

        it('should return custom function fail', function() {
          var cb = this.stub();
          cb.returns(false);
          this.as.refute('some expectation', cb).pass().should.equal(true);
          cb.should.have.been.called;
        });

        it('should include generated rules', function() {
          var self = this;
          Object.keys(auditFs.rules).forEach(function(name) {
            if (name === 'assert' || name === 'refute') {
              should.not.exist(self.as.refute[name]);
            } else {
              self.as.refute[name].should.be.a('function');
            }
          });
        });
      });

      describe('.hasFile', function() {
        it('should use negated result', function() {
          this.hasFileStub.restore();
          var exists = true;
          this._Stub.returns(exists);
          this.as.refute.hasFile(this.file).pass().should.equal(!exists);
          this._Stub.should.have.been.calledWithExactly(
            'test', '-f', process.cwd() + '/' + this.file
          );
        });
      });
    });

    describe('grep', function() {
      beforeEach(function() {
        this.textPat = 'needle';
        this.textPatFinal = '"' + this.textPat + '"';
        this.filePat = '/path/to/haystack';
        this.matches = ['foo', 'bar'];
        this.res = {code: 0, output: this.matches.join('\n')};
        this._Stub.returns(this.res);
      });

      describe('#grep variant', function() {
        it('should pass-through args to #exec', function() {
          this.as.grep(this.textPat, this.filePat).pass();
          this._Stub.should.have.been.calledWith(
            'exec', ['grep', '-l', this.textPatFinal, this.filePat].join(' ')
          );
        });

        it('should return true on match', function() {
          this.as.grep(this.textPat, this.filePat).pass().should.equal(true);
        });

        it('should return false on match', function() {
          this.res.code = 1;
          this.res.output = '';
          this.as.grep(this.textPat, this.filePat).pass().should.equal(false);
        });

        it('should return false on error', function() {
          this.res.code = 2;
          this.as.grep(this.textPat, this.filePat).pass().should.equal(false);
        });
      });

      describe('#grepv variant', function() {
        it('should pass-through args to #exec', function() {
          this.as.grepv(this.textPat, this.filePat).pass();
          this._Stub.should.have.been.calledWith(
            'exec', ['grep', '-vl', this.textPatFinal, this.filePat].join(' ')
          );
        });

        it('should return true on match', function() {
          this.as.grepv(this.textPat, this.filePat).pass().should.equal(true);
        });

        it('should return false on no match', function() {
          this.res.code = 1;
          this.res.output = '';
          this.as.grep(this.textPat, this.filePat).pass().should.equal(false);
        });

        it('should return false on error', function() {
          this.res.code = 2;
          this.as.grep(this.textPat, this.filePat).pass().should.equal(false);
        });

        it('should merge flags', function() {
          this.as.grepv('-r', this.textPat, this.filePat).pass().should.equal(true);
          this._Stub.should.have.been.calledWith(
            'exec', ['grep', '-rvl', this.textPatFinal, this.filePat].join(' ')
          );
        });
      });
    });

    describe('#hasDir', function() {
      it('should return shelljs pass-through result', function() {
        this._Stub.returns(true);
        this.as.hasDir('').pass().should.equal(true);
        this._Stub.should.have.been.calledWithExactly('test', '-d', process.cwd() + '/');
      });
    });

    describe('#hasFile', function() {
      it('should return shelljs pass-through result', function() {
        this.hasFileStub.restore();
        this._Stub.returns(true);
        this.as.hasFile(this.file).pass().should.equal(true);
        this._Stub.should.have.been.calledWithExactly(
          'test', '-f', process.cwd() + '/' + this.file
        );
      });
    });
  });
});
