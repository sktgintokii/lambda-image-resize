'use strict';

const aws = require('aws-sdk');
const client  = new aws.S3({ apiVersion: '2006-03-01' });

class S3 {
  static getObject(options) {
    const key = options.key;
    const bucket = options.bucket;
    return new Promise((resolve, reject) => {
      client.getObject({ Bucket: bucket, Key: key }, (err, data) => {
        if (err) return reject(err);
        if ('image-processed' in data.Metadata) return reject('Object was already processed.');

        resolve({
          metaData: data.Metadata,
          body: data.Body,
        });
      });
    });
  }

  static putObject(options) {
    const bucket = options.bucket;
    const key = options.key;
    const body = options.body;
    const metaData = options.metaData;
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: bucket,
        Key: key,
        Body: body,
        Metadata: metaData || { 'image-processed': 'true' },
      };

      client.putObject(params, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

module.exports = S3;
