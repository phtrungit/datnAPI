'use strict';
var moment = require('moment');
module.exports = function(Linechart) {
  Linechart.getReportDay = function(day, month, year, cameras, cb) {
    let listCamera = [];
    cameras.forEach(function(camera) {
      listCamera.push(camera);
    });
    let value = {
      in: [],
      out: [],
      total: [],
    };
    for (let i = 0; i < 24; i++) {
      value.in[i] = 0;
      value.out[i] = 0;
      value.total[i] = 0;
    }
    Linechart.find({
      where: {
        day: day,
        month: month,
        year: year,
        cameraName: {inq: cameras},
      },
    }, function(err, listReport) {
      // console.log('listReportMultiCam', listReport);
      // console.log('cameras', cameras[0]);
      for (let i = 0; i < listReport.length; i++) {
        value.in[listReport[i].hour] += listReport[i].in;
        value.out[listReport[i].hour] += listReport[i].out;
        value.total[listReport[i].hour] += listReport[i].in + listReport[i].out;
      }
      cb(null, value);
    });
  };
  Linechart.getReportRangeDay = function(day, month, year, dayTo, monthTo, yearTo, cameras, cb) {
    let listCamera = [];
    cameras.forEach(function(camera) {
      listCamera.push(camera);
    });
    let value = {
      in: [],
      out: [],
      total: [],
    };
    for (let i = 0; i < dayTo - day + 1; i++) {
      value.in[i] = 0;
      value.out[i] = 0;
      value.total[i] = 0;
    }
    Linechart.find({
      where: {
        day: {between: [day, dayTo]},
        month: {between: [month, monthTo]},
        year: {between: [year, yearTo]},
        cameraName: {inq: cameras},
      },
    }, function(err, listReport) {
      // console.log('listReportMultiCam', listReport);
      // .log('cameras', cameras[0]);
      for (let i = 0; i < listReport.length; i++) {
        value.in[listReport[i].day - day] += listReport[i].in;
        value.out[listReport[i].day - day] += listReport[i].out;
        value.total[listReport[i].day - day] += listReport[i].in + listReport[i].out;
      }
      cb(null, value);
    });
  };
  Linechart.getReportMonth = function(month, year, cameras, cb) {
    let value = {
      in: [],
      out: [],
      total: [],
    };
    for (let i = 0; i < 31; i++) {
      value.in[i] = 0;
      value.out[i] = 0;
      value.total[i] = 0;
    }
    Linechart.find({
      where: {
        month: month,
        year: year,
        cameraName: {inq: cameras},
      },
    }, function(err, listReport) {
      for (let i = 0; i < listReport.length; i++) {
        value.in[listReport[i].day - 1] += listReport[i].in;
        value.out[listReport[i].day - 1] += listReport[i].out;
        value.total[listReport[i].day - 1] +=
          listReport[i].out + listReport[i].in;
      }
      cb(null, value);
    });
  };
  Linechart.getReportYear = function(year, cameras, cb) {
    let value = {
      in: [],
      out: [],
      total: [],
    };
    for (let i = 0; i < 12; i++) {
      value.in[i] = 0;
      value.out[i] = 0;
      value.total[i] = 0;
    }
    Linechart.find({
      where: {
        year: year,
        cameraName: {inq: cameras},
      },
    }, function(err, listReport) {
      for (let i = 0; i < listReport.length; i++) {
        value.in[listReport[i].month - 1] += listReport[i].in;
        value.out[listReport[i].month - 1] += listReport[i].out;
        value.total[listReport[i].month - 1] +=
          listReport[i].out + listReport[i].in;
      }
      cb(null, value);
    });
  };
  Linechart.checkDayProcessed = function(cameras, cb) {
    Linechart.find({
      where: {
        cameraName: {inq: cameras},
      },
    }, function(err, listReport) {
      let value = [];
      for (let i = 1; i < listReport.length; i++) {
        let newDate = new Date(listReport[i].year, listReport[i].month - 1, listReport[i].day, 0, 0, 0, 0);
        {
          value.push(newDate);
        }
      }
      cb(null, value);
    });
  };
  Linechart.getLastDayProcessed = function(cameras, cb) {
    Linechart.find({
      where: {
        cameraName: {inq: cameras},
      },
      order: '_id DESC',
    }, function(err, listReport) {
      // console.log(listReport);
      let value = [];
      for (let i = 0; i < cameras.length; i++)
        value[i] = [];
      /* let listCamera = [];
      for (let j = 0; j < cameras.length; j++)      {
        console.log('camera name',cameras)
        listCamera.push(cameras[j]);
      } */
      for (let i = 0; i < listReport.length; i++) {
        if (value[cameras.indexOf(listReport[i].cameraName)].length === 0)        {
          // console.log('true');
          console.log('if index', cameras.indexOf(listReport[i].cameraName));
          value[cameras.indexOf(listReport[i].cameraName)] = listReport[i];
        } else {
          if (listReport[i].day === value[cameras.indexOf(listReport[i].cameraName)].day &&
            listReport[i].month === value[cameras.indexOf(listReport[i].cameraName)].month &&
            listReport[i].year === value[cameras.indexOf(listReport[i].cameraName)].year) {
            value[cameras.indexOf(listReport[i].cameraName)].in += listReport[i].in;
            value[cameras.indexOf(listReport[i].cameraName)].out += listReport[i].out;
          }
        }
      }
      cb(null, value);
    });
  };
  Linechart.remoteMethod(
    'getReportDay',
    {
      http: {path: '/get-reports-day', verb: 'get'},
      accepts: [{arg: 'day', type: 'number', http: {source: 'query'}},
        {arg: 'month', type: 'number', http: {source: 'query'}},
        {arg: 'year', type: 'number', http: {source: 'query'}},
        {arg: 'cameras', type: 'array', http: {source: 'query'}}],
      returns: {arg: 'listReport', type: 'Object'},
    }
  );
  Linechart.remoteMethod(
    'getReportMonth',
    {
      http: {path: '/get-reports-month', verb: 'get'},
      accepts: [
        {arg: 'month', type: 'number', http: {source: 'query'}},
        {arg: 'year', type: 'number', http: {source: 'query'}},
        {arg: 'cameras', type: 'array', http: {source: 'query'}}],

      returns: {arg: 'listReport', type: 'Object'},
    }
  );
  Linechart.remoteMethod(
    'getReportYear',
    {
      http: {path: '/get-reports-year', verb: 'get'},
      accepts: [
        {arg: 'year', type: 'number', http: {source: 'query'}},
        {arg: 'cameras', type: 'array', http: {source: 'query'}}],

      returns: {arg: 'listReport', type: 'Object'},
    }
  );
  Linechart.remoteMethod(
    'checkDayProcessed',
    {
      http: {path: '/check-day-processed', verb: 'get'},
      accepts: [
        {arg: 'cameras', type: 'array', http: {source: 'query'}}],

      returns: {arg: 'data', type: 'Object'},
    }
  );
  Linechart.remoteMethod(
    'getLastDayProcessed',
    {
      http: {path: '/getLastDayProcessed', verb: 'get'},
      accepts: [
        {arg: 'cameras', type: 'array', http: {source: 'query'}}],

      returns: {arg: 'data', type: 'Object'},
    }
  );
  Linechart.remoteMethod(
    'getReportRangeDay',
    {
      http: {path: '/get-reports-range-of-day', verb: 'get'},
      accepts: [{arg: 'day', type: 'number', http: {source: 'query'}},
        {arg: 'month', type: 'number', http: {source: 'query'}},
        {arg: 'year', type: 'number', http: {source: 'query'}},
        {arg: 'dayTo', type: 'number', http: {source: 'query'}},
        {arg: 'monthTo', type: 'number', http: {source: 'query'}},
        {arg: 'yearTo', type: 'number', http: {source: 'query'}},
        {arg: 'cameras', type: 'array', http: {source: 'query'}}],

      returns: {arg: 'listReport', type: 'Object'},
    }
  );
};
