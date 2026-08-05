import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
      <Link to="/" className="text-lg font-bold text-slate-100">
        Tiermaker
      </Link>
      {user && (
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span>{user.displayName}</span>
          <Button variant="secondary" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      )}
    </header>
  );
}
