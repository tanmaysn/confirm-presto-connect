var express = require('express');
var path = require('path');
// Local dependecies
var config = require('nconf');

// create the express app
// configure middlewares
var bodyParser = require('body-parser');
var morgan = require('morgan');
var logger = require('winston');
var prestoApi = require('../../lib/presto-api')
var compression = require('compression');

var app;

var start = function (cb) {
  'use strict';
  // Configure express 
  app = express();

  app.use(compression({ filter: shouldCompress }));
  app.use(morgan('common'));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json({ type: '*/*' }));
  //app.use(express.compress());

  function shouldCompress (req, res) {
    if (req.headers['x-no-compression']) {
      // don't compress responses with this request header
      return false
    }
  
    // fallback to standard filter function
    return compression.filter(req, res)
  }
  
  logger.info('[SERVER] Initializing routes');
  require('../../app/routes/index')(app);

  app.use(express.static('public'));

  app.post('/presto', function (req, res) {

    console.log(req.body.query);
    var query = req.body.query;
    prestoApi.executeQuery(query, function (data, error) {

      res.setHeader('content-type', 'application/json');
      if (!error) {
        res.setHeader('status', 200);
        logger.debug('sending the Data in response');
        console.log('sending');
        res.send(data);
      } else {
        res.setHeader('status', 500);
        //logger.debug('sending the error response');
        res.send(error);
      }

    });
  });

  app.post('/prestoBasic', function (req, res) {

    var query = req.body.query;
    prestoApi.executeQueryBasic(query, function (data) {

      res.setHeader('status', 200);
      res.setHeader('content-type', 'application/json');
      logger.log(data);
      res.send(data);
    });
  });

  // Error handler
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: (app.get('env') === 'development' ? err : {})
    });
    next(err);
  });

  app.listen(config.get('NODE_PORT'));
  logger.info('[SERVER] Listening on port ' + config.get('NODE_PORT'));

  if (cb) {
    return cb();
  }
};

module.exports = start;