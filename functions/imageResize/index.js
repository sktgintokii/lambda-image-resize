'use strict';

const fs = require('fs');
const path = require('path');
const aws = require('aws-sdk');
const S3 = require('./libs/S3');
const ImageProcessor = require('./libs/ImageProcessor');
const config = require('./config');
const tmpFolderPath = '/tmp';

const handler = (event, context, callback) => {
  // event = event || require('./event.json');
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' ')); // i.e. filename
  const bucketPair = config.s3BucketPairs.find((bucketPair) => {
    return bucketPair.get === bucket;
  }) || {};
  const originalImagePath = path.join(tmpFolderPath, key);
  const resizedImagePath = path.join(tmpFolderPath, `out_${key}`); // TODO: prevent uncommon char in file name

  const fetchImage = () => {
    return new Promise((resolve, reject) => {
      S3.getObject({ bucket, key })
      .then((data) => {
        const wstream = fs.createWriteStream(originalImagePath);
        wstream.write(data.body);
        wstream.end();

        console.log(`Finish getting file '${key}' from bucket '${bucket}'`);
        resolve();
      })
      .catch(reject);
    });
  };

  const resizeImage = () => {
    return new Promise((resolve, reject) => {
      const imageConfig = Object.assign(config.image, {
        src: originalImagePath,
        dest: resizedImagePath,
      });
      ImageProcessor.exec(imageConfig)
      .then((result) => {
        console.log(`Finish image resize.`);
        resolve(result);
      })
      .catch((err) => {
        console.log(`Fail to resize file. Error: ${err}`);
        reject(err);
      });
    })
  };

  const uploadImage = () => {
    return new Promise((resolve, reject) => {
      fs.readFile(resizedImagePath, (err, data) => {
        if (err) return reject(err);

        const options = {
          bucket: bucketPair.put,
          key: `${key}`,
          body: data,
          metadata: { 'image-processed': 'true' },
        };
        S3.putObject(options)
        .then(() => {
          console.log(`Successfully upload file to bucket '${bucketPair.put}'`);
          resolve();
        })
        .catch((err) => {
          console.log(`Fail to upload file. Error: ${err}`);
          reject(err);
        })
      });
    });
  };

  fetchImage()
  .then(resizeImage)
  .then(uploadImage)
  .then(() => {
    console.log('All done');
    callback();
  })
  .catch((err) => {
    console.log('Failed', err.stack);
    callback(err);
  })
}

exports.handler = handler;
