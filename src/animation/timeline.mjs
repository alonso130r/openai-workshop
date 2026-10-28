export const clamp = (value) => Math.min(1, Math.max(0, value));
export function progress(time, start, end) {
  const x = clamp((time - start) / (end - start));
  return x * x * (3 - 2 * x);
}
export const interpolate = (from, to, amount) => from + (to - from) * amount;
const plan = (duration, entries) => ({
  duration,
  beats: entries.map(([at, label]) => ({ at, label })),
});
export const scenes = {
  IntroExample: plan(24, [
    [0, "Start with three numbers"],
    [4, "Add 3"],
    [8, "Apply ReLU"],
    [12, "Trace the temporary"],
    [17, "Combine the operations"],
    [21, "Keep the same output"],
    [24, "Same result, less movement"],
  ]),
  ClassicCompiler: plan(20, [
    [0, "The source program"],
    [4, "List the operations"],
    [8, "Choose instructions"],
    [12, "Find work with fixed inputs"],
    [16, "Calculate it early"],
    [20, "The program can skip this calculation"],
  ]),
  Memory: plan(22, [
    [0, "Device memory"],
    [4, "Limited space nearby"],
    [8, "Load values"],
    [13, "Reuse values on chip"],
    [18, "Finish with a result"],
    [22, "Movement can dominate arithmetic"],
  ]),
  Compiler: plan(22, [
    [0, "List the calculations"],
    [4, "Show which values each calculation needs"],
    [8, "Choose a multiply program"],
    [13, "Group calculations that can run together"],
    [18, "Use one program for the group"],
    [22, "One possible execution plan"],
  ]),
  Fusion: plan(26, [
    [0, "Two GPU programs"],
    [4, "Load and add bias"],
    [8, "Write the temporary"],
    [12, "Read it back for ReLU"],
    [16, "Bring the kernels together"],
    [21, "Keep the temporary inside"],
    [26, "Remove the round trip"],
  ]),
  DotProduct: plan(26, [
    [0, "The two input matrices"],
    [4, "Choose a row and column"],
    [8, "Multiply corresponding entries"],
    [12, "Add the first pair of products"],
    [16, "Keep the same row"],
    [21, "Compute the next output"],
    [26, "The row is reused"],
  ]),
  Tiling: plan(28, [
    [0, "Inputs and output"],
    [4, "Choose a small output block"],
    [8, "Load the first blocks"],
    [12, "Add the first contribution"],
    [17, "Load the next input blocks"],
    [22, "Add the next contribution"],
    [28, "Write the completed output block"],
  ]),
  Replay: plan(22, [
    [0, "The CPU launches GPU programs"],
    [4, "Launch each GPU program"],
    [8, "Notice the waiting"],
    [12, "Replay a prepared sequence"],
    [17, "Keep the same calculation times"],
    [22, "Less time waiting between launches"],
  ]),
  Guards: plan(24, [
    [0, "A plan for these inputs"],
    [4, "Check the assumptions"],
    [8, "Reuse with the same shape"],
    [12, "A different input shape"],
    [16, "The shape does not fit"],
    [20, "Build another plan"],
    [24, "Some plans cover several shapes"],
  ]),
};
export function nextBeat(scene, time, direction) {
  return direction > 0
    ? (scene.beats.find((b) => b.at > time + 0.02)?.at ?? scene.duration)
    : ([...scene.beats].reverse().find((b) => b.at < time - 0.02)?.at ?? 0);
}
