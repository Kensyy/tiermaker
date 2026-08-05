import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(displayName.trim(), passcode);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="glass w-full max-w-sm space-y-5 rounded-lg p-8 shadow-[0_0_50px_rgba(76,243,255,0.06)]">
        <div>
          <h1 className="glow-cyan font-mono text-lg uppercase tracking-[0.15em] text-neon-cyan">Tiermaker</h1>
          <p className="mt-2 text-sm leading-relaxed text-neon-muted">
            Pick a name and a passcode. First time here? This creates your account.
          </p>
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            minLength={2}
            maxLength={24}
            required
            autoFocus
          />
          <Input
            placeholder="Passcode"
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            minLength={4}
            required
          />
        </div>

        {error && <p className="font-mono text-xs text-tier-s">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Continue"}
        </Button>
      </form>
    </div>
  );
}
