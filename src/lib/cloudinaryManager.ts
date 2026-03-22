const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME) {
    throw new Error(
      "Cloudinary Cloud Name not configured. Check your .env.local file."
    );
  }

  if (!UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary Upload Preset not configured. Check your .env.local file."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "pec/college");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

export function getOptimizedImageUrl(
  publicId: string,
  width: number = 400,
  height: number = 400
): string {
  if (!CLOUD_NAME) {
    throw new Error("Cloudinary Cloud Name not configured");
  }
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/w_${width},h_${height},c_fill,f_auto,q_auto/${publicId}`;
}
