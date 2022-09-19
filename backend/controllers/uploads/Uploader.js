const { S3 } = require('aws-sdk');
require('dotenv').config();

class Uploader {
  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_ACCESS_KEY_SECRET,
    });
  }

  async upload(file, key) {
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Body: file.buffer,
      Key: key,
      ContentType: file.mimetype,
    };

    return await this.s3.upload(params).promise();
  }
}

module.exports = new Uploader();
