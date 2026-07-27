export type BrandAccent = "blue" | "green" | "amber" | "red" | "muted";

export const brandAccentVar: Record<BrandAccent, string> = {
  blue: "var(--icdu-blue)",
  green: "var(--icdu-green)",
  amber: "var(--icdu-amber)",
  red: "var(--icdu-red)",
  muted: "var(--icdu-fg-ghost)",
};
