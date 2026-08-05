import type { PresenceUser } from "@tiermaker/shared";

interface PresenceBarProps {
  users: PresenceUser[];
}

export function PresenceBar({ users }: PresenceBarProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 font-mono text-xs text-neon-muted">
      <span className="uppercase tracking-wide">Viewing now</span>
      <div className="flex gap-1.5">
        {users.map((user) => (
          <span
            key={user.userId}
            className="rounded-full border px-2.5 py-0.5"
            style={{
              borderColor: `${user.color}80`,
              color: user.color,
              backgroundColor: `${user.color}14`,
              textShadow: `0 0 6px ${user.color}80`,
            }}
          >
            {user.displayName}
          </span>
        ))}
      </div>
    </div>
  );
}
