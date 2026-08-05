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
    <div className="border-b border-slate-800 p-2">
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Folders</span>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="text-xs text-indigo-400 hover:text-indigo-300"
        >
          + New
        </button>
      </div>

      <div
        className={`cursor-pointer rounded px-2 py-1 text-sm ${
          selectedFolderId === null ? "bg-indigo-500/20 text-indigo-300" : "text-slate-300 hover:bg-slate-800"
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
