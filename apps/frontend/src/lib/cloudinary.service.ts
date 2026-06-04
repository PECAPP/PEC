/** FORCED REFRESH **/
export function getFileType(mimeType: string): "image" | "video" | "file" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "file";
}

export function validateFileSize(file: File): boolean {
  return file.size <= 25 * 1024 * 1024; // 25MB max for everything as simplified check
}

export async function uploadMedia(file: File, userId: string): Promise<string> {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: "POST",
    body: formData
  });
  
  if (!response.ok) throw new Error("Upload failed");
  const data = await response.json();
  return data.secure_url;
}
