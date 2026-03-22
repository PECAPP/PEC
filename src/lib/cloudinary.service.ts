import { storage } from '@/config/storage';
import { ref, uploadBytes, getDownloadURL } from '@/lib/dataClient';
// Cloudinary configuration from org settings or env
export function getCloudinaryConfig(orgSettings?: {
  cloudinary?: {
    cloudName: string;
    uploadPreset: string;
  };
}) {
  // Use org settings if available, otherwise fall back to env
  return {
    cloudName: orgSettings?.cloudinary?.cloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo",
    uploadPreset: orgSettings?.cloudinary?.uploadPreset || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default"
  };
}

// Upload file to Cloudinary
export async function uploadToCloudinary(
  file: File,
  orgSettings?: { cloudinary?: { cloudName: string; uploadPreset: string } }
): Promise<string> {
  const config = getCloudinaryConfig(orgSettings);
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", config.uploadPreset);
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/upload`,
    {
      method: "POST",
      body: formData
    }
  );
  
  if (!response.ok) {
    throw new Error("Upload failed");
  }
  
  const data = await response.json();
  return data.secure_url;
}

// Alternative: Upload to object storage (fallback if Cloudinary not configured)
export async function uploadToStorageFallback(
  file: File,
  path: string
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// Smart upload: Try Cloudinary first, fallback to object storage
export async function uploadMedia(
  file: File,
  userId: string,
  orgSettings?: { cloudinary?: { cloudName: string; uploadPreset: string } }
): Promise<string> {
  // Check if Cloudinary is configured
  const config = getCloudinaryConfig(orgSettings);
  
  if (config.cloudName && config.cloudName !== "demo") {
    try {
      return await uploadToCloudinary(file, orgSettings);
    } catch (error) {
      console.error("Cloudinary upload failed, falling back to storage:", error);
    }
  }
  
  // Fallback to object storage
  const timestamp = Date.now();
  const fileName = `${userId}/${timestamp}_${file.name}`;
  return uploadToStorageFallback(file, `chat-media/${fileName}`);
}

// Get file type category
export function getFileType(mimeType: string): "image" | "video" | "file" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "file";
}

// Validate file size (10MB for images, 50MB for videos, 25MB for files)
export function validateFileSize(file: File): boolean {
  const type = getFileType(file.type);
  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    video: 50 * 1024 * 1024, // 50MB
    file: 25 * 1024 * 1024   // 25MB
  };
  
  return file.size <= maxSizes[type];
}
