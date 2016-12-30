AWS Lambda Image Resize
------------------------
### Dependency
1. NodeJS@4.4.7
2. apex
4. npm

### Preinstall
1. Set aws credentials to env
```$ export AWS_ACCESS_KEY_ID=<yourAccessKey>```
```$ export AWS_SECRET_ACCESS_KEY=<yourSecretKey>```

### Required AWS Role Permission

1. AmazonS3FullAccess (For download and upload images)
2. AWSLambdaBasicExecutionRole
3. AWSLambdaS3ExecutionRole

### How To Run

1. Deploy to lambda
```$ apex deploy imageResize```
2. Edit config to add buckets to be used for image resize.
```$ vim <project>/imageResize/config.js```
Add bucket pairs.
'get' is the bucket name for getting the original image.
'put' is the bucket name for uploading resized image.
```
s3BucketPairs: [
    {
      get: 'nmi-poc-2',
      put: 'nmi-poc-2-resized',
    },
    {
      get: 'nmi-poc-3',
      put: 'nmi-poc-3-resized',
    }
  ]
```
3. Open browser and go to AWS lambda console.
4. Find the function deployed just now and add S3 triggers(ObjectCreated - All).
5. Repeat step4 until all the 'get' buckets are added.
6. Upload an image to one of the 'get' bucket and a resized image in the 'put' bucket
