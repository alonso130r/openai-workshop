import original from "./content.json";
import originalCopy from "./presentation-copy.json";
import practical from "./practical-slides.json";

// Keep descriptor IDs for visual selection; navigation IDs follow display order.
const ordered = [...original.slice(0, 22), ...practical, ...original.slice(22)];
const revisedTiming: Record<number, string> = {
  23: "37:00–38:45",
  24: "38:45–40:00",
  25: "40:00–41:30",
  26: "41:30–43:00",
  27: "43:00–44:00",
};
export const content = ordered.map((slide, index) => ({
  ...slide,
  visualId: slide.id,
  id: index + 1,
  timing: slide.id === 28 ? "44:00–45:00"
    : slide.id === 29 ? "45:00–49:00"
    : slide.id === 30 || slide.id === 31 ? "Backup, outside the scheduled 49 minutes" : revisedTiming[slide.id] ?? slide.timing,
}));
export const copy: { id: number; title: string; presenter?: string; speakerExtra?: string; recap?: string }[] = ordered.map((slide, index) => ({
  ...originalCopy.find((entry) => entry.id === slide.id),
  title: originalCopy.find((entry) => entry.id === slide.id)?.title ?? slide.title,
  id: index + 1,
}));
