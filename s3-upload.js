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
 console.log("S3", file.data)

 const fs = require('fs');
let data = file.data // you image stored on arrayBuffer variable;
data = Buffer.from(data);
fs.writeFile(file.name, data, err => { // Assets is a folder present in your root directory
      if (err) {
         console.log(err);
      } else {
         console.log('File created successfully!');
      }
}); 

 
 s3bucket.createBucket(function () {
   var params = {
    Bucket: BUCKET_NAME,
    Key: file.name,
    Body: Buffer.from(file.data, "binary")
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