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

test("short talk has 21 contiguous timed slides, all nine scenes and a sourced Jalapeño example", async () => {
  const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  const [revised, archive] = await Promise.all([
    readJson("../src/presentation-slides.json"),
    readJson("../src/content.json"),
  ]);
  assert.equal(revised.length, 21);
  assert.equal(new Set(revised.map((slide) => slide.visualId)).size, 21);
  const seconds = (value) => value.split(":").reduce((minutes, part) => minutes * 60 + Number(part), 0);
  let end = 0;
  for (const slide of revised) {
    const [start, finish] = slide.timing.split("–").map(seconds);
    assert.equal(start, end, `Timing gap before ${slide.title}`);
    assert.ok(finish > start);
    end = finish;
    assert.ok(slide.title && slide.notes && slide.takeaway && slide.transition);
    assert.ok(archive.some((entry) => entry.id === slide.visualId) || slide.scene === null);
  }
  assert.equal(end, 32 * 60);
  assert.equal(revised.filter((slide) => archive.find((entry) => entry.id === slide.visualId)?.scene).length, 9);
  const resources = await readJson("../src/resources.json");
  assert.equal(revised.at(-1).visualId, 204);
  assert.deepEqual(revised.at(-1).links, resources.flatMap((group) => group.links.map((link) => link.url)));
  const chip = revised.find((slide) => slide.visualId === 203);
  assert.match(chip.title, /Jalapeño/);
  assert.match(chip.notes, /lab/);
  assert.match(chip.notes, /conceptual/);
  assert.ok(chip.links.includes("https://openai.com/index/openai-broadcom-jalapeno-inference-chip/"));
});
