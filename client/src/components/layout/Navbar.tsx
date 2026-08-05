import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="glass flex items-center justify-between px-4 py-3">
      <Link to="/" className="glow-cyan font-mono text-sm uppercase tracking-[0.15em] text-neon-cyan">
        Tiermaker
      </Link>
      {user && (
        <div className="flex items-center gap-3 font-mono text-xs text-neon-muted">
          <span>{user.displayName}</span>
          <Button variant="secondary" onClick={() => logout()} className="py-1.5">
            Log out
          </Button>
        </div>
      )}
    </header>
  );
}
