"use client";
import { useState } from "react";

export default function TickerAdder({ onAdd }: { onAdd: (t: string) => void }) {
  const [t, setT] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!t.trim()) return;
        onAdd(t);
        setT("");
      }}
      className="flex items-center gap-2"
    >
      <input
        value={t}
        onChange={(e) => setT(e.target.value)}
        placeholder="Add ticker (e.g., AAPL)"
        className="rounded-lg border px-3 py-1.5 text-sm"
      />
      <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white">Add</button>
    </form>
  );
}
