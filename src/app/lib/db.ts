import { Pool } from "pg";

let _pool: Pool | null = null;

export function db() {
  if (_pool) return _pool;
  const cs = process.env.DATABASE_URL;
  if (!cs) throw new Error("DATABASE_URL not set");
  _pool = new Pool({ connectionString: cs, max: 3 });
  return _pool;
}
