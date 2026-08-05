import type { ImageAsset } from "@tiermaker/shared";

export function DragPreview({ image }: { image: ImageAsset | undefined }) {
  if (!image) return null;

  return (
    <div className="h-20 w-20 rotate-3 cursor-grabbing rounded-md border border-indigo-400 bg-slate-900 shadow-xl">
      <img
        src={image.url}
        alt={image.originalName}
        className="h-full w-full rounded-md object-cover"
        draggable={false}
      />
    </div>
  );
}
