var sinon = require('sinon');
var chai = require('chai');
var fs = require('fs');
var util = require('util');
var sprintf = util.format;

var should = chai.should();
chai.Assertion.includeStack = true;
chai.use(require('sinon-chai'));

var auditShelljs = require('../../..');

require('sinon-doublist')(sinon, 'mocha');

describe('AuditShelljs', function() {
  'use strict';

  beforeEach(function() {
    this.auditShelljs = new auditShelljs.create();
    this.resOK = {code: 0};
  });

  describe('constructor', function() {
    it.skip('should queue target dir check', function() {
    });
  });

  describe('prototype', function() {
    it.skip('should include generated auditors', function() {
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
