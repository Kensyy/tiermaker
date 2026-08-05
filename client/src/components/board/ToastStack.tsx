import { useToastStore } from "../../state/useToastStore";

export function ToastStack() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="glass animate-[fade-in_0.15s_ease-out] rounded-md px-3 py-2 font-mono text-xs shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          style={{ borderColor: `${toast.color}80`, color: toast.color, textShadow: `0 0 6px ${toast.color}80` }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
