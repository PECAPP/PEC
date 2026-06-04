// Background removal using remove.bg API (free tier: 50 images/month)
// Get API key from: https://www.remove.bg/api

const REMOVEBG_API_KEY = process.env.NEXT_PUBLIC_REMOVEBG_API_KEY;

export async function removeBackground(file: File): Promise<Blob> {
  if (!REMOVEBG_API_KEY) {
    throw new Error(
      "Remove.bg API key not configured. Get free key at https://www.remove.bg/api"
    );
  }

  const formData = new FormData();
  formData.append("image_file", file);
  formData.append("size", "auto");

  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": REMOVEBG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.errors?.[0]?.title || "Failed to remove background"
      );
    }

    return await response.blob();
  } catch (error) {
    console.error("Remove.bg error:", error);
    throw error;
  }
}

export async function processLogoImage(
  file: File,
  removeBackgroundFlag: boolean
): Promise<File> {
  if (removeBackgroundFlag && REMOVEBG_API_KEY) {
    try {
      const processedBlob = await removeBackground(file);
      return new File([processedBlob], file.name, { type: "image/png" });
    } catch (error) {
      console.warn("Background removal failed, using original:", error);
      return file;
    }
  }
  return file;
}
