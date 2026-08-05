import { useCursorStore } from "../../state/useCursorStore";

export function CursorsOverlay() {
  const cursors = useCursorStore((state) => state.cursorsByUserId);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" data-export-ignore>
      {Object.values(cursors).map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute flex items-center gap-1.5 transition-[left,top] duration-75 ease-linear"
          style={{ left: cursor.x, top: cursor.y }}
        >
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: cursor.color, boxShadow: `0 0 8px 2px ${cursor.color}` }}
          />
          <span
            className="glass whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[10px] tracking-wide"
            style={{ color: cursor.color, textShadow: `0 0 6px ${cursor.color}80` }}
          >
            {cursor.displayName}
          </span>
        </div>
      ))}
    </div>
  );
}
