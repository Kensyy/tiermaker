import type { ImageAsset, TierItem } from "@tiermaker/shared";

export type DragData =
  | { kind: "item"; item: TierItem }
  | { kind: "image"; image: ImageAsset }
  | { kind: "tier"; tierId: number };
