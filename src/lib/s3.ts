import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export function extractS3KeyFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname.startsWith("/")
      ? url.pathname.slice(1)
      : url.pathname;

    if (
      pathname.startsWith("profile-images/") ||
      pathname.startsWith("event-images/")
    ) {
      return pathname;
    }

    return null;
  } catch (error) {
    console.error("Error parsing S3 URL:", error);
    return null;
  }
}

export async function deleteImageFromS3(imageUrl: string): Promise<boolean> {
  try {
    const key = extractS3KeyFromUrl(imageUrl);
    if (!key) {
      console.error("Could not extract S3 key from URL:", imageUrl);
      return false;
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      console.error("AWS_S3_BUCKET_NAME environment variable is not set");
      return false;
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    console.log("Successfully deleted image from S3:", key);
    return true;
  } catch (error) {
    console.error("Error deleting image from S3:", error);
    return false;
  }
}

export async function uploadImageToS3(
  file: File,
  userId: string,
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME environment variable is not set");
  }

  const fileExtension = file.name.split(".").pop() || "jpg";
  const fileName = `profile-images/${userId}-${Date.now()}.${fileExtension}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);

  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileName}`;
}

export async function uploadEventImageToS3(
  file: File,
  fileName: string,
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME environment variable is not set");
  }

  const fileExtension = file.name.split(".").pop() || "jpg";
  const key = `event-images/${fileName}.${fileExtension}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);

  return `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
}

export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string,
  userId: string,
): Promise<{ uploadUrl: string; fileUrl: string }> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME environment variable is not set");
  }

  const fileExtension = fileName.split(".").pop() || "jpg";
  const key = `profile-images/${userId}-${Date.now()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl };
}

export function validateS3Config(): { valid: boolean; missing: string[] } {
  const requiredVars = [
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_S3_BUCKET_NAME",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  return {
    valid: missing.length === 0,
    missing,
  };
}
