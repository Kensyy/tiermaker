const GAP = 1000;
const MIN_GAP = 2;

/** Position for a new row appended at the end of a list. */
export function appendPosition(lastPosition: number | undefined): number {
  return lastPosition === undefined ? GAP : lastPosition + GAP;
}

/**
 * Position for a row inserted between two neighbors (either may be absent at
 * the start/end of the list). Returns null when the gap has collapsed below
 * MIN_GAP and the caller should reindex the list before inserting.
 */
export function betweenPosition(before: number | undefined, after: number | undefined): number | null {
  if (before === undefined && after === undefined) return GAP;
  if (before === undefined) return after! / 2;
  if (after === undefined) return before + GAP;
  const gap = after - before;
  if (gap < MIN_GAP) return null;
  return before + gap / 2;
}

/** Recomputes evenly-spaced positions for an ordered list of row ids. */
export function reindex(ids: number[]): { id: number; position: number }[] {
  return ids.map((id, index) => ({ id, position: (index + 1) * GAP }));
}
