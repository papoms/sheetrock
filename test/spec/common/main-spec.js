/*global define */
/*jshint jasmine: true*/

(function (root, tests) {

  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['sheetrock'], function (sheetrock) {
      tests(sheetrock);
    });
  } else if (typeof module === 'object' && module.exports) {
    tests(require('../../../src/sheetrock.js'));
  } else {
    tests(root.sheetrock);
  }

}(this, function (sheetrock) {

  'use strict';

  describe('Sheetrock', function () {

    var requestURLs = [
      // "Legacy" (pre-2014)
      'https://docs.google.com/spreadsheet/ccc?key=0AlRp2ieP7izLdGFNOERTZW0xLVpROFc3X3FJQ2tSb2c#gid=0',
      // "New" (2014 and later)
      'https://docs.google.com/spreadsheets/d/1qT1LyvoAcb0HTsi2rHBltBVpUBumAUzT__rhMvrz5Rk/edit?usp=sharing#gid=0'
    ];

    var testData = {
      row10: {
        team: 'STL',
        position: 'SS',
        firstName: 'Ozzie',
        lastName: 'Smith',
        bats: 'Both',
        average: '0.28'
      },
      row15: {
        team: 'HOU',
        position: 'C',
        firstName: 'Alan',
        lastName: 'Ashby',
        bats: 'Both',
        average: '0.257'
      }
    };

    requestURLs.forEach(function (requestURL) {

      var responseArgs;
      var testOptions;

      it('retrieves data from a Google Sheet', function (done) {

        var asyncCallback = function () {
          responseArgs = arguments;
          done();
        };

        testOptions = {
          url: requestURL,
          query: 'select A,B,C,D,E,L where E = \'Both\' order by L desc',
          fetchSize: 10,
          labels: Object.keys(testData.row10),
          callback: jasmine.createSpy('testCallback').and.callFake(asyncCallback),
          rowTemplate: jasmine.createSpy('testRowTemplate')
        };

        sheetrock(testOptions);

      });

      it('calls the callback', function () {
        expect(testOptions.callback).toHaveBeenCalled();
        expect(testOptions.callback.calls.count()).toEqual(1);
      });

      it('calls the row template', function () {
        expect(testOptions.rowTemplate).toHaveBeenCalled();
        expect(testOptions.rowTemplate.calls.count()).toEqual(testOptions.fetchSize);
      });

      it('doesn\'t return an error', function () {
        var error = responseArgs[0];
        expect(error).toBeDefined();
        expect(error).toBe(null);
      });

      describe('returns an options object', function () {

        it('with expected properties', function () {
          var options = responseArgs[1];
          expect(options).toBeDefined();
          expect(options).not.toBe(null);
          expect(options.user).toBeDefined();
          expect(options.response).toBeDefined();
        });

      });

      describe('returns a raw data object', function () {

        it('with expected properties', function () {
          var rawData = responseArgs[2];
          expect(rawData).toBeDefined();
          expect(rawData).not.toBe(null);
          expect(rawData.status).toEqual('ok');
        });

        it('with the expected dimensions', function () {
          var options = responseArgs[1];
          var rawData = responseArgs[2];
          expect(rawData.table.cols.length).toEqual(testOptions.labels.length);
          expect(rawData.table.rows.length).toEqual(testOptions.fetchSize + options.response.header);
        });

      });

      describe('returns a table array', function () {

        it('with expected properties', function () {
          var tableArray = responseArgs[3];
          expect(tableArray).toBeDefined();
          expect(tableArray).not.toBe(null);
          expect(Array.isArray(tableArray)).toBe(true);
        });

        it('with the expected dimensions', function () {
          var options = responseArgs[1];
          var tableArray = responseArgs[3];
          expect(tableArray.length).toEqual(testOptions.fetchSize + options.response.header);
        });

        it('containing the expected row 10', function () {
          var tableArray = responseArgs[3];
          expect(tableArray[10].num).toEqual(11);
          expect(tableArray[10].cells).toEqual(testData.row10);
        });

      });

      describe('returns output HTML', function () {

        it('with expected properties', function () {
          var outputHTML = responseArgs[4];
          expect(outputHTML).toBeDefined();
          expect(outputHTML).not.toBe(null);
          expect(typeof outputHTML).toEqual('string');
        });

      });

      it('retrieves more data from a Google Sheet', function (done) {

        var asyncCallback = function () {
          responseArgs = arguments;
          done();
        };

        testOptions.fetchSize = 5;
        testOptions.callback = jasmine.createSpy('testCallback').and.callFake(asyncCallback);

        sheetrock(testOptions);

      });

      it('calls the callback', function () {
        expect(testOptions.callback).toHaveBeenCalled();
        expect(testOptions.callback.calls.count()).toEqual(1);
      });

      describe('returns a table array', function () {

        it('containing the expected row 15', function () {
          var tableArray = responseArgs[3];
          expect(tableArray[4].num).toEqual(16);
          expect(tableArray[4].cells).toEqual(testData.row15);
        });

      });

    });

  });

}));