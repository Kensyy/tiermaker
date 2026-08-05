import { useCursorStore } from "../../state/useCursorStore";

export function CursorsOverlay() {
  const cursors = useCursorStore((state) => state.cursorsByUserId);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {Object.values(cursors).map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute flex items-center gap-1 transition-[left,top] duration-75 ease-linear"
          style={{ left: cursor.x, top: cursor.y }}
        >
          <div
            className="h-3 w-3 rotate-12 rounded-sm"
            style={{ backgroundColor: cursor.color }}
          />
          <span
            className="whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.displayName}
          </span>
        </div>
      ))}
    </div>
  );
}
