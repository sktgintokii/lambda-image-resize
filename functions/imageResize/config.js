'use strict';

const path = require('path');

module.exports = {
  image: {
    resizeOpts: {
      width: 64,
      height: 64,
      ignoreAspectRatio: false,
      shrinkOnly: false,
      enlargeOnly: false,
    }
  },
  s3BucketPairs: [
    {
      get: 'nmi-poc-2',
      put: 'nmi-poc-2',
    },
    {
      get: 'nmi-poc-3',
      put: 'nmi-poc-3',
    }
  ]
};
