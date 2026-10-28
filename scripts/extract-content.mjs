import { readFile, writeFile, mkdir } from "node:fs/promises";
const guide = await readFile(
  new URL("../docs/Your_AI_Slide_Guide.md", import.meta.url),
  "utf8",
);
const matches = [...guide.matchAll(/^### Slide (\d+): (.+)$/gm)];
const field = (body, key) =>
  body
    .match(
      new RegExp("\\*\\*" + key + ":\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n|$)"),
    )?.[1]
    ?.trim() ?? "";
const content = matches.map((m, i) => {
  const body = guide.slice(
    m.index + m[0].length,
    matches[i + 1]?.index ?? guide.indexOf("## Manim asset checklist"),
  );
  const id = Number(m[1]);
  const scene = field(body, "Manim scene").replaceAll("`", "");
  return {
    id,
    title: m[2],
    timing: field(body, "Timing"),
    purpose: field(body, "Purpose"),
    brief: field(body, "What should appear"),
    notes: field(body, "Explanation"),
    takeaway: field(body, "Audience takeaway"),
    transition: field(body, "Transition"),
    scene: scene || null,
    storyboard:
      body
        .match(
          /\*\*Animation sequence:\*\*([\s\S]*?)(?=\*\*Presentation cue)/,
        )?.[1]
        ?.trim() ?? "",
    links: [
      ...new Set(
        [...body.matchAll(/https?:\/\/[^\s<>\)]+/g)].map((m) =>
          m[0].replace(/[.,]$/, ""),
        ),
      ),
    ],
  };
});
await mkdir(new URL("../src", import.meta.url), { recursive: true });
await writeFile(
  new URL("../src/content.json", import.meta.url),
  JSON.stringify(content, null, 2) + "\n",
);
