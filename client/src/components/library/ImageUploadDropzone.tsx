import { useRef, useState, type ChangeEvent } from "react";
import { api } from "../../lib/api";
import { Button } from "../ui/Button";

interface ImageUploadDropzoneProps {
  folderId: number | null;
  onUploaded: () => void;
}

export function ImageUploadDropzone({ folderId, onUploaded }: ImageUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("image", file);
        if (folderId !== null) form.append("folderId", String(folderId));
        await api.postForm("/images", form);
      }
      onUploaded();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="border-t border-neon-line p-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading…" : "Upload images"}
      </Button>
    </div>
  );
}
