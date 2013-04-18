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

describe('auditShelljs', function() {
  'use strict';

  describe('AuditShelljs', function() {
    beforeEach(function() {
      this.auditShelljs = new auditShelljs.create();
      this.resOK = {code: 0};
    });

    it('should do something', function() {
      console.log('\x1B[33m<---------- INCOMPLETE\x1B[0m'); // TODO
    });
  });
});
