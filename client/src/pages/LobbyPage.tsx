import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { Board } from "@tiermaker/shared";
import { api } from "../lib/api";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";

export function LobbyPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .get<Board[]>("/boards")
      .then(setBoards)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    setCreating(true);
    try {
      const board = await api.post<Board>("/boards", { name: newBoardName.trim() });
      setBoards((prev) => [...prev, board]);
      setNewBoardName("");
      setModalOpen(false);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-100">Boards</h1>
          <Button onClick={() => setModalOpen(true)}>New board</Button>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : boards.length === 0 ? (
          <p className="text-slate-400">No boards yet. Create the first one.</p>
        ) : (
          <ul className="space-y-2">
            {boards.map((board) => (
              <li key={board.id}>
                <Link
                  to={`/boards/${board.id}`}
                  className="block rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 transition-colors hover:border-indigo-500"
                >
                  {board.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New board">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            placeholder="Board name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            autoFocus
            required
          />
          <Button type="submit" className="w-full" disabled={creating}>
            {creating ? "Creating…" : "Create"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
