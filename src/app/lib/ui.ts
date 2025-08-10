export function cls(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}
