export function getStatColor(variant: string) {
  switch (variant) {
    case "primary":
      return "text-[var(--color-accent)]";

    case "muted":
      return "text-[var(--color-muted)]";

    default:
      return "text-[var(--color-default)]";
  }
}
