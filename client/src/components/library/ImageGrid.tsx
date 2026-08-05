import { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { ImageAsset } from "@tiermaker/shared";
import { api, resolveAssetUrl } from "../../lib/api";

function LibraryThumbnail({ image }: { image: ImageAsset }) {
  const draggable = useDraggable({ id: `image-${image.id}`, data: { kind: "image", image } });

  return (
    <div
      ref={draggable.setNodeRef}
      className={`h-16 w-16 shrink-0 touch-none rounded-md border border-neon-line bg-neon-glass ${
        draggable.isDragging ? "opacity-30" : ""
      }`}
      {...draggable.listeners}
      {...draggable.attributes}
    >
      <img
        src={resolveAssetUrl(image.url)}
        alt={image.originalName}
        className="h-full w-full rounded-md object-cover"
        draggable={false}
      />
    </div>
  );
}

interface ImageGridProps {
  folderId: number | null;
  refreshToken: number;
}

export function ImageGrid({ folderId, refreshToken }: ImageGridProps) {
  const [images, setImages] = useState<ImageAsset[]>([]);

  useEffect(() => {
    const query = folderId === null ? "" : `?folderId=${folderId}`;
    api.get<ImageAsset[]>(`/images${query}`).then(setImages);
  }, [folderId, refreshToken]);

  if (images.length === 0) {
    return <p className="p-3 font-mono text-xs text-neon-muted">No images in this folder yet.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 p-2">
      {images.map((image) => (
        <LibraryThumbnail key={image.id} image={image} />
      ))}
    </div>
  );
}
