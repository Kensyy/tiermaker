import { useState } from "react";
import { FolderTree } from "./FolderTree";
import { ImageGrid } from "./ImageGrid";
import { ImageUploadDropzone } from "./ImageUploadDropzone";

export function LibrarySidebar() {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-l border-slate-800 bg-slate-950">
      <FolderTree selectedFolderId={selectedFolderId} onSelect={setSelectedFolderId} />
      <div className="flex-1 overflow-y-auto">
        <ImageGrid folderId={selectedFolderId} refreshToken={refreshToken} />
      </div>
      <ImageUploadDropzone folderId={selectedFolderId} onUploaded={() => setRefreshToken((t) => t + 1)} />
    </aside>
  );
}
