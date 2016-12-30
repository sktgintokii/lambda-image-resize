'use strict';

const _ = require('lodash');
const fs = require('fs');
const aws = require('aws-sdk');
const uuidV4 = require('uuid/v4');
const config = require('../config');
const S3Client = new aws.S3({ apiVersion: '2006-03-01' });

const putObject = (options) => {
  const bucket = options.bucket;
  const key = options.key;
  const body = options.body;
  const metaData = options.metaData;
  const acl = options.acl;
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: body,
      Metadata: metaData,
      ACL: acl,
    };

    S3Client.putObject(params, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

exports.uploadImage = (req, res, next) => {
  const file = req.file;
  const options = {
    bucket: config.S3.bucket,
    key: file.originalname || uuidV4(),
    body: fs.createReadStream(file.path),
    metaData: config.S3.metaData,
    acl: config.S3.ACL,
  };

  if (!file) return res.status(422).send('No image is uploaded');

  console.log(file)

  putObject(options)
  .then(() => {
    res.send('/Get upload image');
  })
  .catch((err) => {
    console.log(err)
    res.status(500).send('Error: Fail to upload image');
  });

};
