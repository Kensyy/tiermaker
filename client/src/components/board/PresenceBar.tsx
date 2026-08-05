import type { PresenceUser } from "@tiermaker/shared";

interface PresenceBarProps {
  users: PresenceUser[];
}

export function PresenceBar({ users }: PresenceBarProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-slate-400">
      <span>Viewing now:</span>
      <div className="flex gap-1.5">
        {users.map((user) => (
          <span
            key={user.userId}
            className="rounded-full px-2 py-0.5 font-medium text-white"
            style={{ backgroundColor: user.color }}
          >
            {user.displayName}
          </span>
        ))}
      </div>
    </div>
  );
}
