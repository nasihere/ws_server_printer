const AWS = require('aws-sdk');
const BUCKET_NAME = 'wsprinter';
const IAM_USER_KEY = 'AKIA5QT6SAUAWY55JFIP';
const IAM_USER_SECRET = '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';
function uploadToS3(req,res, file, success_callback) {
 let s3bucket = new AWS.S3({
   accessKeyId: IAM_USER_KEY,
   secretAccessKey: IAM_USER_SECRET,
   Bucket: BUCKET_NAME,
 });
 s3bucket.createBucket(function () {
   var params = {
    Bucket: BUCKET_NAME,
    Key: file.name,
    Body: file.data,
   };
   s3bucket.upload(params, function (err, data) {
    if (err) {
     console.log('error in callback');
     console.log(err);
    }
    console.log('success');
    console.log(data);
    return success_callback(req,res,data)
   });
 });
}

function helloTest() {
    console.log('test')
}
module.exports = {
    uploadToS3,
    helloTest
}