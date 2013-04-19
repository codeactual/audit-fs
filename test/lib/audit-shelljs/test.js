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
    this.dir = '/path/to/dir';
    this.as = new auditShelljs.create();
    this.as.set('dir', this.dir);
    this.resOK = {code: 0};
  });

  describe('constructor', function() {
    it('should use cwd as default target dir', function() {
      this.as = new auditShelljs.create();
      this.as.get('dir').should.equal(process.cwd());
    });

    it('should queue target dir check', function() {
      this.as.tests.length.should.equal(1);
      this.as.tests[0].name.should.equal('hasDir');
      this.as.tests[0].args.should.deep.equal(['']);
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

  describe('.createAuditor', function() {
    it.skip('should create a function that queues a test wrapper', function() {
    });
  });

  describe('generated test wrapper', function() {
    it.skip('should skip current test if a past test failed', function() {
    });

    it.skip('should pass-through all args', function() {
    });

    it.skip('should save results', function() {
    });

    it.skip('should correctly update match status on hit', function() {
    });

    it.skip('should correctly update match status on miss', function() {
    });
  });


  describe('#hit', function() {
    it.skip('should begin commands from target dir', function() {
    });

    it.skip('should run queued tests', function() {
    });

    it.skip('should return match result', function() {
    });
  });

  describe('#failReason', function() {
    it.skip('should return last test result', function() {
    });
  });

  describe('test', function() {
    describe('#custom', function() {
      it.skip('should return shelljs pass-through result', function() {
      });
    });

    describe('#grep', function() {
      it.skip('should return shelljs pass-through result', function() {
      });
    });

    describe('#grepv', function() {
      it.skip('should return shelljs pass-through result', function() {
      });
    });

    describe('#hasDir', function() {
      it.skip('should return shelljs pass-through result', function() {
      });
    });

    describe('#hasFile', function() {
      it.skip('should return shelljs pass-through result', function() {
      });
    });
  });
});
