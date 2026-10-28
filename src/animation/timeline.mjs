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
    [4, "Add the bias"],
    [8, "Apply ReLU"],
    [12, "Trace the temporary"],
    [17, "Combine the operations"],
    [21, "Keep the same output"],
    [24, "Same result, less movement"],
  ]),
  ClassicCompiler: plan(20, [
    [0, "The source program"],
    [4, "Reveal the structure"],
    [8, "Generate a target"],
    [12, "Find a constant expression"],
    [16, "Fold the constant"],
    [20, "A transformation over the IR"],
  ]),
  Memory: plan(22, [
    [0, "Device memory"],
    [4, "A smaller working set"],
    [8, "Load values"],
    [13, "Reuse values on chip"],
    [18, "Finish with a result"],
    [22, "Movement can dominate arithmetic"],
  ]),
  Compiler: plan(22, [
    [0, "Capture tensor operations"],
    [4, "Expose the dependencies"],
    [8, "Lower matrix multiplication"],
    [13, "Group compatible operations"],
    [18, "Generate the fused kernel"],
    [22, "One possible execution plan"],
  ]),
  Fusion: plan(26, [
    [0, "Separate kernels"],
    [4, "Load and add bias"],
    [8, "Write the temporary"],
    [12, "Read it back for ReLU"],
    [16, "Bring the kernels together"],
    [21, "Compute locally"],
    [26, "Remove the round trip"],
  ]),
  DotProduct: plan(26, [
    [0, "The two input matrices"],
    [4, "Choose a row and column"],
    [8, "Multiply corresponding entries"],
    [12, "Accumulate the first output"],
    [16, "Keep the same row"],
    [21, "Compute the next output"],
    [26, "The row is reused"],
  ]),
  Tiling: plan(28, [
    [0, "Inputs and output"],
    [4, "Choose an output tile"],
    [8, "Load the first blocks"],
    [12, "Accumulate a partial product"],
    [17, "Advance the reduction chunk"],
    [22, "Add the next contribution"],
    [28, "Store the completed tile"],
  ]),
  Replay: plan(22, [
    [0, "The host submits GPU work"],
    [4, "Separate kernel launches"],
    [8, "Notice the submission gaps"],
    [12, "Replay a prepared sequence"],
    [17, "Preserve the kernel durations"],
    [22, "Less time waiting for submission"],
  ]),
  Guards: plan(24, [
    [0, "A specialized plan"],
    [4, "Check the assumptions"],
    [8, "Reuse with the same shape"],
    [12, "A different input shape"],
    [16, "The static assumption fails"],
    [20, "Compile another variant"],
    [24, "Dynamic shapes can sometimes reuse one plan"],
  ]),
};
export function nextBeat(scene, time, direction) {
  return direction > 0
    ? (scene.beats.find((b) => b.at > time + 0.02)?.at ?? scene.duration)
    : ([...scene.beats].reverse().find((b) => b.at < time - 0.02)?.at ?? 0);
}
