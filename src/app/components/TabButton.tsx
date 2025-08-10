import { cls } from "@/app/lib/ui";

export default function TabButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cls(
        "rounded-lg border px-3 py-1.5 text-sm",
        active ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}
