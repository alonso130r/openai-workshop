import test from "node:test";
import assert from "node:assert/strict";
import {
  progress,
  interpolate,
  nextBeat,
  scenes,
} from "../src/animation/timeline.mjs";

test("motion has deterministic held endpoints and smooth interpolation", () => {
  assert.equal(progress(-1, 2, 4), 0);
  assert.equal(progress(5, 2, 4), 1);
  assert.equal(progress(3, 2, 4), 0.5);
  assert.equal(interpolate(30, 90, progress(3, 2, 4)), 60);
  const startVelocity = progress(2.001, 2, 4) / 0.001;
  assert.ok(
    startVelocity < 0.002,
    "motion eases out of a hold instead of snapping",
  );
});

test("every scene can step forward, back, and hold its final frame", () => {
  assert.equal(Object.keys(scenes).length, 9);
  for (const scene of Object.values(scenes)) {
    assert.equal(scene.beats[0].at, 0);
    assert.equal(scene.beats.at(-1).at, scene.duration);
    assert.ok(
      scene.beats.every((b, i) => i === 0 || b.at > scene.beats[i - 1].at),
    );
    assert.equal(nextBeat(scene, scene.duration, 1), scene.duration);
    assert.equal(nextBeat(scene, 0, -1), 0);
    for (let i = 0; i < scene.beats.length - 1; i++) {
      assert.equal(
        nextBeat(scene, scene.beats[i].at, 1),
        scene.beats[i + 1].at,
      );
      assert.equal(
        nextBeat(scene, scene.beats[i + 1].at, -1),
        scene.beats[i].at,
      );
    }
  }
});
