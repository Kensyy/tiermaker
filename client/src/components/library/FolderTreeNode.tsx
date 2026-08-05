import { useState } from "react";
import type { FolderNode } from "@tiermaker/shared";

interface FolderTreeNodeProps {
  node: FolderNode;
  depth: number;
  selectedFolderId: number | null;
  onSelect: (folderId: number) => void;
}

export function FolderTreeNode({ node, depth, selectedFolderId, onSelect }: FolderTreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedFolderId === node.id;

  return (
    <div>
      <div
        className={`flex cursor-pointer items-center gap-1 rounded px-1 py-1 text-sm ${
          isSelected ? "bg-indigo-500/20 text-indigo-300" : "text-slate-300 hover:bg-slate-800"
        }`}
        style={{ paddingLeft: depth * 14 + 4 }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="w-3 shrink-0 text-slate-500"
          >
            {expanded ? "▾" : "▸"}
          </button>
        )}
        {!hasChildren && <span className="w-3 shrink-0" />}
        <span className="truncate">{node.name}</span>
      </div>
      {expanded &&
        node.children.map((child) => (
          <FolderTreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedFolderId={selectedFolderId}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}
