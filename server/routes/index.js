'use strict';

const express = require('express');
const path = require('path');

const apiRouter = require('../api').router;
const staticPath = path.join(__dirname, '../../client');

module.exports = (app) => {
  app.use('/api', apiRouter); // serve API

  // serve static files
  app.use(express.static(staticPath));

  app.use('*', (req, res, next) => {
    res.status(404).send('Error: Not found');
  });
};
