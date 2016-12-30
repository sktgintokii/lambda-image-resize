'use strict';

module.exports = {
  port: 9000,
  multer: {
    dest: 'uploads/',
  },
  S3: {
    bucket: 'nmi-poc-2',
    metaData: {
      sizes: JSON.stringify([
        { width: 100, height: 100 },
        { width: 100, height: 200 },
        { width: 200, height: 100 },
        { width: 400, height: 100 },
      ]),
    },
  }
};
