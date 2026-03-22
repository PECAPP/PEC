import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { uploadMedia } from "@/lib/cloudinary.service";
import { doc, updateDoc } from '@/lib/dataClient';

import { toast } from "sonner";

interface Props {
  currentAvatar?: string;
  onAvatarUpdate: (url: string) => void;
  uploadPath: string; // e.g., "users/userId" or "rooms/roomId"
  recordPath: string; // e.g., "users/userId" or "chatRooms/roomId"
  fieldName?: string; // Field to update (default: "avatar" or "photoURL")
}

export function AvatarUpload({ 
  currentAvatar, 
  onAvatarUpdate, 
  uploadPath,
  recordPath,
  fieldName = "avatar"
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const handleUpload = async () => {
    if (!preview || !fileInputRef.current?.files?.[0]) return;

    setIsUploading(true);
    try {
      const file = fileInputRef.current.files[0];
      const url = await uploadMedia(file, uploadPath);

      // Update backend record
      const docRef = doc(({} as any), ...recordPath.split("/"));
      await updateDoc(docRef, {
        [fieldName]: url
      });

      onAvatarUpdate(url);
      toast.success("Avatar updated!");
      setIsOpen(false);
      setPreview(null);
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative group"
      >
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Upload className="w-6 h-6 text-white" />
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Avatar</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setPreview(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors"
              >
                <Upload className="w-12 h-12 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to select image</p>
              </button>
            )}

            {preview && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? "Uploading..." : "Save Avatar"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
