import type { ImageAsset } from "@tiermaker/shared";

export function DragPreview({ image }: { image: ImageAsset | undefined }) {
  if (!image) return null;

  return (
    <div className="glass h-20 w-20 cursor-grabbing rounded-md border-neon-cyan shadow-[0_0_24px_rgba(76,243,255,0.4)]">
      <img
        src={image.url}
        alt={image.originalName}
        className="h-full w-full rounded-md object-cover"
        draggable={false}
      />
    </div>
  );
}
