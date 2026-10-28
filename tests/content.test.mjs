import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("presentation preserves all descriptor slides and nine named scenes", async () => {
  const content = JSON.parse(
    await readFile(new URL("../src/content.json", import.meta.url), "utf8"),
  );
  const descriptor = JSON.parse(
    await readFile(
      new URL("./fixtures/descriptor.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(content.length, 31);
  assert.deepEqual(
    content.map(({ id, title, scene }) => ({ id, title, scene })),
    descriptor.slides,
  );
  assert.deepEqual(
    content.map((s) => s.id),
    Array.from({ length: 31 }, (_, i) => i + 1),
  );
  assert.deepEqual(
    content.filter((s) => s.scene).map((s) => s.scene),
    [
      "IntroExample",
      "ClassicCompiler",
      "Memory",
      "Compiler",
      "Fusion",
      "DotProduct",
      "Tiling",
      "Replay",
      "Guards",
    ],
  );
  assert.ok(content.every((s) => s.notes && s.takeaway && s.timing));
});
