"use server";

import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

// Initialize S3 client
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
  region: process.env.AWS_REGION,
});

// Function to generate a pre-signed URL
export async function generatePresignedUrl(fileName:string, fileType:string) {
  const key = `products/${uuidv4()}-${fileName}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME, // Your S3 bucket name
    Key: key,
    Expires: 60, // URL expiration time in seconds
    ContentType: fileType,
    ACL: "public-read", // Make the object publicly readable
  };

  const uploadURL = await s3.getSignedUrlPromise("putObject", params);

  // Return the key and the URL
  return { uploadURL, key };
}
