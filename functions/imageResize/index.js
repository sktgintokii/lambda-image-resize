'use strict';

const fs = require('fs');
const path = require('path');
const aws = require('aws-sdk');
const Promise = require('bluebird');
const S3 = require('./libs/S3');
const ImageProcessor = require('./libs/ImageProcessor');
const config = require('./config');
const tmpFolderPath = '/tmp';
const extname = '.jpg';

const getResizedImagePath = (options) => {
  const filename = options.filename;
  const width = options.width;
  const height = options.height;
  const basename = path.basename(filename, extname);

  return path.join(tmpFolderPath, `${basename}_${width}x${height}${extname}`);
};

const fetchImage = (options) => {
  const bucket = options.bucket;
  const key = options.key;
  const dest = options.dest;

  return new Promise((resolve, reject) => {
    S3.getObject({ bucket, key })
    .then((data) => {
      const wstream = fs.createWriteStream(dest);
      wstream.write(data.body);
      wstream.end();

      console.log(`Finish getting file '${key}' from bucket '${bucket}'`);
      resolve(data);
    })
    .catch(reject);
  });
};

const resizeImage = (options) => {
  const width = options.width;
  const height = options.height;
  const src = options.src;
  const dest = options.dest;

  return new Promise((resolve, reject) => {
    const imageConfig = Object.assign(config.image, {
      src: src,
      dest: dest,
      resizeOpts: {
        width: width,
        height: height,
      },
    });
    ImageProcessor.exec(imageConfig)
    .then((result) => {
      console.log(`Finish image resize.`, result);
      resolve(result);
    })
    .catch((err) => {
      console.log(`Fail to resize file. Error: ${err}`);
      reject(err);
    });
  })
};

const uploadImage = (options) => {
  const src = options.src;
  const key = path.basename(src);
  const bucket = options.bucket; //bucketPair.put

  return new Promise((resolve, reject) => {
    fs.readFile(src, (err, data) => {
      if (err) return reject(err);

      const putOptions = {
        bucket: bucket,
        key: `${key}`,
        body: data,
      };
      S3.putObject(putOptions)
      .then(() => {
        console.log(`Successfully upload file to bucket '${bucket}'`);
        resolve();
      })
      .catch((err) => {
        console.log(`Fail to upload file. Error: ${err}`);
        reject(err);
      });
    });
  });
};

const handler = (event, context, callback) => {
  // for local testing
  // event = event || require('./event.json');
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' ')); // i.e. filename
  const originalImagePath = path.join(tmpFolderPath, key);

  // Main function
  fetchImage({ bucket, key, dest: originalImagePath })
  .then((imageData) => {
    const sizes = imageData.metaData.sizes || [];
    return Promise.mapSeries(sizes, (size) => {
      const width = size.width;
      const height = size.height;
      const resizedImagePath = getResizedImagePath({ filename: key, width, height });
      const resizeOptions = {
        width,
        height,
        src: originalImagePath,
        dest: resizedImagePath,
      };
      const uploadOptions = {
        src: resizedImagePath,
        bucket,
      };

      return resizeImage(resizeOptions).then(() => uploadImage(uploadOptions));
    });
  })
  .then(() => {
    console.log('All done');
    callback();
  })
  .catch((err) => {
    console.log('Failed', err.stack || err);
    callback(err);
  });
};

exports.handler = handler;

// for local testing
// handler(null, null, function() {});
