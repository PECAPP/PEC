import { useState } from "react";
import { Image, Video, Paperclip, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadMedia, validateFileSize, getFileType } from "@/lib/cloudinary.service";
import { sendMediaMessage } from "@/lib/messages.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  roomId: string;
  onUploadComplete?: () => void;
}

export function MediaUpload({ roomId, onUploadComplete }: Props) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<{url: string; file: File} | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!validateFileSize(file)) {
      toast.error("File is too large. Max: 10MB for images, 50MB for videos, 25MB for files");
      return;
    }

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setPreview({ url: objectUrl, file });
  };

  const handleUpload = async () => {
    if (!preview || !user) return;

    setIsUploading(true);
    try {
      const mediaUrl = await uploadMedia(preview.file, user.uid);
      const fileType = getFileType(preview.file.type);

      // Only include defined fields
      const messageOptions: any = {
        fileName: preview.file.name,
        fileSize: preview.file.size
      };

      await sendMediaMessage(roomId, mediaUrl, fileType, messageOptions);

      toast.success("Media sent!");
      setPreview(null);
      onUploadComplete?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload media");
    } finally {
      setIsUploading(false);
    }
  };

  const cancelPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview.url);
      setPreview(null);
    }
  };

  if (preview) {
    return (
      <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Send Media</h3>
            <Button variant="ghost" size="icon" onClick={cancelPreview}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {getFileType(preview.file.type) === "image" ? (
            <img src={preview.url} alt="Preview" className="max-h-96 w-full object-contain rounded-lg" />
          ) : getFileType(preview.file.type) === "video" ? (
            <video src={preview.url} controls className="max-h-96 w-full rounded-lg" />
          ) : (
            <div className="p-8 bg-secondary rounded-lg text-center">
              <Paperclip className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">{preview.file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(preview.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        type="file"
        id="video-upload"
        accept="video/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => document.getElementById("image-upload")?.click()}
        title="Send image"
      >
        <Image className="w-5 h-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => document.getElementById("video-upload")?.click()}
        title="Send video"
      >
        <Video className="w-5 h-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => document.getElementById("file-upload")?.click()}
        title="Send file"
      >
        <Paperclip className="w-5 h-5" />
      </Button>
    </div>
  );
}
