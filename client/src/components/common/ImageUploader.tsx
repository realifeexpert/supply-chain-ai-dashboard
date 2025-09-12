import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, XCircle, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

// Component ke props ka interface
interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  initialImageUrl?: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  initialImageUrl,
}) => {
  const [preview, setPreview] = useState<string | null>(
    initialImageUrl || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsLoading(true);
      setError(null);
      setPreview(URL.createObjectURL(file)); // Temporary local preview

      const formData = new FormData();
      formData.append("file", file);
      // Aapke .env file se upload preset ka naam yahan aayega
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Image upload failed");
        }

        const data = await response.json();
        onUploadSuccess(data.secure_url); // Parent component ko final URL bhejein
        setPreview(data.secure_url);
      } catch (err) {
        setError("Upload failed. Please try again.");
        setPreview(null); // Error hone par preview hata dein
      } finally {
        setIsLoading(false);
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] }, // Har tarah ki image file accept karega
    multiple: false,
  });

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Dropzone ko trigger hone se rokein
    setPreview(null);
    onUploadSuccess(""); // Parent component ko batayein ki image hata di gayi hai
  };

  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1">
        Product Image
      </label>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-zinc-600 rounded-lg p-4 text-center cursor-pointer transition-colors",
          "hover:border-cyan-500 hover:bg-zinc-800/50",
          isDragActive && "border-cyan-500 bg-zinc-800/50"
        )}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-24 text-zinc-400">
            <Loader className="animate-spin" />
            <p className="mt-2">Uploading...</p>
          </div>
        ) : preview ? (
          <div className="relative w-full h-24">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain rounded"
            />
            <button
              onClick={removeImage}
              className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 text-white hover:bg-black/80"
              title="Remove image"
            >
              <XCircle size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-24 text-zinc-400">
            <UploadCloud size={24} />
            <p className="mt-2 text-sm">
              Drag & drop an image here, or click to select
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
