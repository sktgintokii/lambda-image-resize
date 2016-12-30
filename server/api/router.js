'use strict';

const express = require('express');
const controller = require('./controller');
const middleware = require('../middleware');
const router = express.Router();

router.post('/uploadImage', middleware.upload.single('image'), controller.uploadImage);

module.exports = router;
