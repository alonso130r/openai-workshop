import original from "./content.json";
import originalCopy from "./presentation-copy.json";
import revised from "./presentation-slides.json";

// Visual IDs select existing diagrams; display IDs follow the shorter talk.
export const content = revised.map((slide, index) => ({
  brief: slide.takeaway,
  purpose: slide.takeaway,
  storyboard: "",
  scene: null as string | null,
  links: [] as string[],
  ...original.find((entry) => entry.id === slide.visualId),
  ...slide,
  id: index + 1,
}));

// Backups are reached explicitly through Contents, never by advancing the talk.
const backupIds = [30, 31, 11, 15, 22, 25, 24, 27];
export const backupContent = backupIds.map((visualId, index) => {
  const slide = original.find((entry) => entry.id === visualId)!;
  return {
    ...slide,
    visualId,
    id: content.length + index + 1,
    title: `Backup: ${slide.title.replace(/^Backup: /, "")}`,
    timing: "Backup and take-home material, outside the 33-minute talk",
    transition: "",
    scene: null,
  };
});
export const allContent = [...content, ...backupContent];
export const copy = allContent.map((slide) => ({
  id: slide.id,
  title: slide.title,
  presenter: slide.id === 1 ? originalCopy[0].presenter : undefined,
  // Full prompt belongs in take-home material, not in the spoken sequence.
  speakerExtra: slide.visualId === 24
    ? originalCopy.find((entry) => entry.id === 24)?.speakerExtra
    : undefined,
}));
