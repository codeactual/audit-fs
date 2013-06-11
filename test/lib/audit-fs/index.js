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
var rules = auditFs.rules;

require('sinon-doublist')(sinon, 'mocha');
require('sinon-doublist-fs')('mocha');

describe('AuditFs', function() {
  'use strict';

  beforeEach(function() {
    this.ruleArgs = ['rule test configs'];
    this.ruleFn = {iAmA: 'rule function'};
    this.ruleName = 'hasSomething';
    this.testRes = {iAmA: 'test result'};
    this.dir = 'dir';
    this.file = 'file.ext';
    this.afs = new auditFs.create();
    this.resOK = {code: 0};
    this.hasDirSpy = this.spy(auditFs.rules, 'hasDir');
    this.hasFileStub = this.stub(auditFs.rules, 'hasFile');
    this.now = Date.now();
  });

  describe('constructor', function() {
    it('should use cwd as default target dir', function() {
      this.afs = new auditFs.create();
      this.afs.get('dir').should.equal(process.cwd());
    });
  });

  describe('prototype', function() {
    it('should include generated rules', function() {
      var self = this;
      Object.keys(auditFs.rules).forEach(function(name) {
        self.afs[name].should.be.a('function');
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
      this.afs.hasFile(this.file).hasDir(this.dir).pass();
      this.hasFileStub.should.have.been.called;
      this.hasDirSpy.should.not.have.been.calledWith(this.dir);
    });

    it('should pass-through all args', function() {
      var _Stub = this.stub(auditFs.rules, '_');
      this.afs._('foo', 'bar', 'baz').pass();
      _Stub.should.have.been.calledWithExactly('foo', 'bar', 'baz');
    });

    it('should save results', function() {
      this.hasFileStub.withArgs(this.file).returns(this.testRes);
      this.afs.hasFile(this.file).pass();
      this.afs.results.length.should.equal(1);
      this.afs.results[0].name.should.equal('hasFile');
      this.afs.results[0].res.should.deep.equal(this.testRes);
      this.afs.results[0].args.should.deep.equal([this.file]);
    });

    it('should not change match status on pass', function() {
      this.hasFileStub.withArgs(this.file).returns(true);
      this.afs.match.should.equal(true);
      this.afs.hasFile(this.file).pass();
      this.afs.match.should.equal(true);
    });

    it('should correctly update match status on miss', function() {
      this.hasFileStub.withArgs(this.file).returns(false);
      this.afs.match.should.equal(true);
      this.afs.hasFile(this.file).pass();
      this.afs.match.should.equal(false);
    });
  });

  describe('#pass', function() {
    it('should begin commands from target dir', function() {
      this.afs.set('dir', this.dir);
      var stub = this.stub(this.afs.shelljs, '_');
      this.afs.pass();
      stub.should.have.been.calledWith('cd', this.dir);
    });

    it('should return match result', function() {
      this.afs.pass().should.equal(true);

      this.hasFileStub.withArgs(this.file).returns(false);
      this.afs.hasFile(this.file).pass().should.equal(false);
    });
  });

  describe('#last', function() {
    it('should return last test result', function() {
      this.hasFileStub.withArgs(this.file).returns(false);
      this.afs.hasDir('').hasFile(this.file).pass();
      this.afs.last().should.deep.equal({
        name: 'hasFile', args: [this.file], res: false
      });
    });
  });

  describe('test', function() {
    beforeEach(function() {
      this._Stub = this.stub(this.afs.shelljs, '_');
    });

    describe('#_', function() {
      it('should return shelljs pass-through result', function() {
        this.afs._('test', '-L', this.file).pass();
        this._Stub.should.have.been.calledWithExactly('test', '-L', this.file);
      });
    });

    describe('#__', function() {
      it('should return outer-shelljs pass-through result', function() {
        var stub = this.stub(this.afs.shelljs, 'grep');
        this.afs.__('grep', 'needle', '/path/to/haystack').pass();
        stub.should.have.been.calledWithExactly('needle', '/path/to/haystack');
      });
    });

    describe('#assert', function() {
      it('should receive OuterShelljs instance', function() {
        var cb = this.stub();
        this.afs.assert('some expectation', cb).pass();
        cb.should.have.been.calledWithExactly(this.afs.shelljs);
      });

      it('should return custom function pass', function() {
        var cb = this.stub();
        cb.returns(false);
        this.afs.assert('some expectation', cb).pass().should.equal(false);
        cb.should.have.been.called;
      });

      it('should return custom function fail', function() {
        var cb = this.stub();
        cb.returns(true);
        this.afs.assert('some expectation', cb).pass().should.equal(true);
        cb.should.have.been.called;
      });
    });

    describe('#refute', function() {
      describe('function', function() {
        it('should receive OuterShelljs instance', function() {
          var cb = this.stub();
          this.afs.refute('some expectation', cb).pass();
          cb.should.have.been.calledWithExactly(this.afs.shelljs);
        });

        it('should return custom function pass', function() {
          var cb = this.stub();
          cb.returns(true);
          this.afs.refute('some expectation', cb).pass().should.equal(false);
          cb.should.have.been.called;
        });

        it('should return custom function fail', function() {
          var cb = this.stub();
          cb.returns(false);
          this.afs.refute('some expectation', cb).pass().should.equal(true);
          cb.should.have.been.called;
        });

        it('should include generated rules', function() {
          var self = this;
          Object.keys(auditFs.rules).forEach(function(name) {
            if (name === 'assert' || name === 'refute') {
              should.not.exist(self.afs.refute[name]);
            } else {
              self.afs.refute[name].should.be.a('function');
            }
          });
        });
      });

      describe('.hasFile', function() {
        it('should use negated result', function() {
          this.hasFileStub.restore();
          var exists = true;
          this._Stub.returns(exists);
          this.afs.refute.hasFile(this.file).pass().should.equal(!exists);
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
          this.afs.grep(this.textPat, this.filePat).pass();
          this._Stub.should.have.been.calledWith(
            'exec', ['grep', '-l', this.textPatFinal, this.filePat].join(' ')
          );
        });

        it('should return true on match', function() {
          this.afs.grep(this.textPat, this.filePat).pass().should.equal(true);
        });

        it('should return false on match', function() {
          this.res.code = 1;
          this.res.output = '';
          this.afs.grep(this.textPat, this.filePat).pass().should.equal(false);
        });

        it('should return false on error', function() {
          this.res.code = 2;
          this.afs.grep(this.textPat, this.filePat).pass().should.equal(false);
        });
      });

      describe('#grepv variant', function() {
        it('should pass-through args to #exec', function() {
          this.afs.grepv(this.textPat, this.filePat).pass();
          this._Stub.should.have.been.calledWith(
            'exec', ['grep', '-vl', this.textPatFinal, this.filePat].join(' ')
          );
        });

        it('should return true on match', function() {
          this.afs.grepv(this.textPat, this.filePat).pass().should.equal(true);
        });

        it('should return false on no match', function() {
          this.res.code = 1;
          this.res.output = '';
          this.afs.grep(this.textPat, this.filePat).pass().should.equal(false);
        });

        it('should return false on error', function() {
          this.res.code = 2;
          this.afs.grep(this.textPat, this.filePat).pass().should.equal(false);
        });

        it('should merge flags', function() {
          this.afs.grepv('-r', this.textPat, this.filePat).pass().should.equal(true);
          this._Stub.should.have.been.calledWith(
            'exec', ['grep', '-rvl', this.textPatFinal, this.filePat].join(' ')
          );
        });
      });
    });

    describe('#exists', function() {
      it('should return shelljs pass-through result', function() {
        this._Stub.returns(true);
        this.afs.exists('').pass().should.equal(true);
        this._Stub.should.have.been.calledWithExactly('test', '-e', process.cwd() + '/');
      });
    });

    describe('#hasDir', function() {
      it('should return shelljs pass-through result', function() {
        this._Stub.returns(true);
        this.afs.hasDir('').pass().should.equal(true);
        this._Stub.should.have.been.calledWithExactly('test', '-d', process.cwd() + '/');
      });
    });

    describe('#hasFile', function() {
      it('should return shelljs pass-through result', function() {
        this.hasFileStub.restore();
        this._Stub.returns(true);
        this.afs.hasFile(this.file).pass().should.equal(true);
        this._Stub.should.have.been.calledWithExactly(
          'test', '-f', process.cwd() + '/' + this.file
        );
      });
    });

    describe('#getFileSize', function() {
      it('should calculate file size', function() {
        this.stubFile('/f').stat('size', 1234).make();
        AuditFs.getFileSize('/f').should.equal(1234);
      });

      it('should calculate directory size recursively', function() {
        this.stubFile('/d').readdir([
          this.stubFile('/d/f0').stat('size', 1),
          this.stubFile('/d/sub0').readdir([
            this.stubFile('/d/sub0/f1').stat('size', 2),
            this.stubFile('/d/sub0/f2').stat('size', 3),
            this.stubFile('/d/sub0/sub1').readdir([
              this.stubFile('/d/sub0/sub1/f3').stat('size', 4)
            ]).stat('size', 4096)
          ]).stat('size', 4096),
          this.stubFile('/d/sub2').readdir([
            this.stubFile('/d/sub2/f4').stat('size', 5)
          ]).stat('size', 4096)
        ]).stat('size', 4096).make();
        AuditFs.getFileSize('/d').should.equal(16399);
      });
    });

    describe('#getFileCount', function() {
      it('should calculate directory file count non-recursively', function() {
        this.stubFile('/d').readdir([
          this.stubFile('/d/f0'),
          this.stubFile('/d/sub0').readdir(['f3', 'f4', 'sub1']),
          this.stubFile('/d/f1'),
          this.stubFile('/d/f2')
        ]).make();
        AuditFs.getFileCount('/d').should.equal(3);
      });
    });

    describe('#minSize', function() {
      it('should fail if min unmet', function() {
        this.stubFile('/f0').stat('size', 3).make();
        rules.minSize({filename: '/f0', size: 4}).should.equal(false);
      });

      it('should pass if min is met exactly', function() {
        this.stubFile('/f0').stat('size', 4).make();
        rules.minSize({filename: '/f0', size: 4}).should.equal(true);
      });

      it('should pass if min is exceeded', function() {
        this.stubFile('/f0').stat('size', 5).make();
        rules.minSize({filename: '/f0', size: 4}).should.equal(true);
      });
    });

    describe('#maxSize', function() {
      it('should fail if max exceeded', function() {
        this.stubFile('/f0').stat('size', 4).make();
        rules.maxSize({filename: '/f0', size: 3}).should.equal(false);
      });

      it('should pass if max is met exactly', function() {
        this.stubFile('/f0').stat('size', 4).make();
        rules.maxSize({filename: '/f0', size: 4}).should.equal(true);
      });

      it('should pass if max is unmet', function() {
        this.stubFile('/f0').stat('size', 3).make();
        rules.maxSize({filename: '/f0', size: 4}).should.equal(true);
      });
    });

    describe('#minCount', function() {
      beforeEach(function() {
        this.stubFile('/f').readdir([
          this.stubFile('/f/a'),
          this.stubFile('/f/b'),
          this.stubFile('/f/c')
        ]).make();
      });

      it('should pass if min is met exactly', function() {
        rules.minCount({filename: '/f', count: 3}).should.equal(true);
      });

      it('should pass if min is exceeded', function() {
        rules.minCount({filename: '/f', count: 2}).should.equal(true);
      });
    });

    describe('#maxCount', function() {
      beforeEach(function() {
        this.stubFile('/f').readdir(['a', 'b', 'c']).make();
        this.stubFile('/f/a').make();
        this.stubFile('/f/b').make();
        this.stubFile('/f/c').make();
      });

      it('should fail if max exceeded', function() {
        rules.maxCount({filename: '/f', count: 2}).should.equal(false);
      });

      it('should pass if max is met exactly', function() {
        rules.maxCount({filename: '/f', count: 3}).should.equal(true);
      });

      it('should pass if max is unmet', function() {
        rules.maxCount({filename: '/f', count: 3}).should.equal(true);
      });
    });

    describe('#created', function() {
      it('should fail if file was not created recently', function() {
        this.stubFile('/f').stat('ctime', new Date(this.now - 10)).make();
        rules.created({filename: '/f', max: 9}).should.equal(false);
      });

      it('should pass if file was created recently', function() {
        this.stubFile('/f').stat('ctime', new Date(this.now - 1)).make();
        rules.created({filename: '/f', max: 9}).should.equal(true);
      });
    });

    describe('#modified', function() {
      it('should fail if file was not updated recently', function() {
        this.stubFile('/f').stat('mtime', new Date(this.now - 10)).make();
        rules.modified({filename: '/f', max: 9}).should.equal(false);
      });

      it('should pass if file was updated recently', function() {
        this.stubFile('/f').stat('mtime', new Date(this.now - 1)).make();
        rules.modified({filename: '/f', max: 9}).should.equal(true);
      });
    });
  });
});
