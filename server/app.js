'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const aws = require('aws-sdk');
const config = require('./config');
const app = express();
const server = require('http').createServer(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
require('./routes')(app);

server.listen(config.port, () => {
  console.log('TW ECMS server listening on port %s in %s mode', config.port, app.get('env'));
});

module.exports = app;
