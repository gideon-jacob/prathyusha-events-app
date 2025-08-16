import { S3Client } from '@aws-sdk/client-s3';

const s3Config = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
}; 

// Create S3 client
export const s3Client = new S3Client(s3Config);
export const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !S3_BUCKET_NAME) {
  console.warn("WARNING: AWS S3 environment variables are not fully configured. S3 operations may fail.");
}
