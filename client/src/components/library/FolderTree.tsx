import { useEffect, useState, type FormEvent } from "react";
import type { Folder, FolderNode } from "@tiermaker/shared";
import { api } from "../../lib/api";
import { FolderTreeNode } from "./FolderTreeNode";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface FolderTreeProps {
  selectedFolderId: number | null;
  onSelect: (folderId: number | null) => void;
}

export function FolderTree({ selectedFolderId, onSelect }: FolderTreeProps) {
  const [tree, setTree] = useState<FolderNode[]>([]);
  const [creating, setCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  function reload() {
    api.get<FolderNode[]>("/folders").then(setTree);
  }

  useEffect(reload, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await api.post<Folder>("/folders", { name: newFolderName.trim(), parentId: selectedFolderId });
    setNewFolderName("");
    setCreating(false);
    reload();
  }

  return (
    <div className="border-b border-neon-line p-2">
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-neon-magenta">// folders</span>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="font-mono text-xs text-neon-cyan hover:text-neon-cyan/80"
        >
          + new
        </button>
      </div>

      <div
        className={`cursor-pointer rounded px-2 py-1 text-sm ${
          selectedFolderId === null ? "bg-neon-cyan/10 text-neon-cyan" : "text-neon-muted hover:bg-neon-glass"
        }`}
        onClick={() => onSelect(null)}
      >
        All images
      </div>

      {tree.map((node) => (
        <FolderTreeNode key={node.id} node={node} depth={0} selectedFolderId={selectedFolderId} onSelect={onSelect} />
      ))}

      {creating && (
        <form onSubmit={handleCreate} className="mt-2 flex gap-1 px-1">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            autoFocus
            className="flex-1 py-1 text-xs"
          />
          <Button type="submit" className="px-2 py-1 text-xs">
            Add
          </Button>
        </form>
      )}
    </div>
  );
}
