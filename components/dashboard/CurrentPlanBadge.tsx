export function CurrentPlanBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${active ? "bg-success text-fg" : "bg-panelSoft text-muted"}`}>
      {active ? "Current" : "Inactive"}
    </span>
  );
}
