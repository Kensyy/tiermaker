import { useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function AddTierRow({ boardId }: { boardId: number }) {
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    // The new tier arrives via the "tier:added" broadcast (which also echoes
    // back to us), so there's nothing to do here beyond posting it.
    await api.post(`/boards/${boardId}/tiers`, { label: label.trim() });
    setLabel("");
    setCreating(false);
  }

  if (!creating) {
    return (
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="w-full py-2 text-center font-mono text-xs text-neon-muted transition-colors hover:text-neon-cyan"
      >
        + add tier
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
      <Input
        autoFocus
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Tier label"
        maxLength={12}
        className="w-32 py-1 text-xs"
      />
      <Button type="submit" className="py-1.5 text-xs">
        Add
      </Button>
      <button
        type="button"
        onClick={() => setCreating(false)}
        className="font-mono text-xs text-neon-muted hover:text-neon-text"
      >
        cancel
      </button>
    </form>
  );
}
