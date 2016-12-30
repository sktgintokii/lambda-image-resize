'use strict'

const multer = require('multer');
const config = require('../config');
const upload = multer(config.multer);

module.exports = upload;
