import { cls } from "@/app/lib/ui";

export default function TabButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cls(
        "rounded-full px-3 py-1.5 text-sm border transition",
        active
          ? "bg-slate-900 text-white border-slate-900 shadow-soft dark:bg-white dark:text-black dark:border-white"
          : "bg-white/70 hover:bg-white border-slate-200 dark:bg-brand-900/60 dark:hover:bg-brand-900/80 dark:border-white/10"
      )}
    >
      {children}
    </button>
  );
}
