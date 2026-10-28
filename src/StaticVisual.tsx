import { MathText } from "./Math";
const sources = {
  tutorial:
    "https://docs.pytorch.org/tutorials/intermediate/torch_compile_tutorial.html",
  trouble:
    "https://docs.pytorch.org/docs/main/user_guide/torch_compiler/torch.compiler_troubleshooting.html",
  triton:
    "https://triton-lang.org/main/getting-started/tutorials/03-matrix-multiplication.html",
  paper: "https://docs.pytorch.org/assets/pytorch2-2.pdf",
  cuda: "https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/",
  graphs:
    "https://docs.pytorch.org/docs/main/user_guide/torch_compiler/torch.compiler_cudagraph_trees.html",
};
function Steps({ items }: { items: [string, string][] }) {
  return (
    <div className="steps">
      {items.map(([a, b], i) => (
        <div className="step" key={a}>
          <span className="step-no">0{i + 1}</span>
          <h3>{a}</h3>
          <p>{b}</p>
        </div>
      ))}
    </div>
  );
}
function Compare({
  left,
  right,
}: {
  left: [string, string, string];
  right: [string, string, string];
}) {
  return (
    <div className="compare">
      {[left, right].map(([a, b, c], i) => (
        <div className={"compare-side " + (i ? "green" : "blue")} key={a}>
          <span className="eyebrow">{a}</span>
          <h3>{b}</h3>
          <p>{c}</p>
        </div>
      ))}
    </div>
  );
}
function Links({ items }: { items: [string, string, string][] }) {
  return (
    <div className="resource-list">
      {items.map(([title, detail, url], i) => (
        <a href={url} target="_blank" rel="noreferrer" key={url}>
          <span className="step-no">0{i + 1}</span>
          <div>
            <h3>{title}</h3>
            <p>{detail}</p>
          </div>
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}
export function StaticVisual({ id }: { id: number }) {
  switch (id) {
    case 3:
      return (
        <div className="question-layout">
          <p className="big-question">
            A correct program.
            <br />
            <span>A better execution plan?</span>
          </p>
          <div className="two-lines">
            <p>Many layers. Different shapes. Different devices.</p>
            <p>Let a compiler find the opportunities.</p>
          </div>
        </div>
      );
    case 4:
      return (
        <>
          <p className="definition">
            A compiler <em>translates a program</em> while preserving its
            required behavior.
          </p>
          <Steps
            items={[
              [
                "Check meaning",
                "Recognize structure and validate the program.",
              ],
              [
                "Represent the work",
                "Make operations and dependencies explicit.",
              ],
              [
                "Generate a target",
                "Produce instructions, bytecode, or another language.",
              ],
            ]}
          />
        </>
      );
    case 6:
      return (
        <Compare
          left={[
            "Ahead of time",
            "Build → run",
            "Translation happens before use. Its cost appears during the build.",
          ]}
          right={[
            "Just in time",
            "Run → compile → reuse",
            "Runtime information can guide compilation. Early calls pay the cost.",
          ]}
        />
      );
    case 7:
      return (
        <Compare
          left={[
            "General programs",
            "Instructions & control flow",
            "Compilers already reason about loops, branches, and numerical work.",
          ]}
          right={[
            "ML emphasis",
            "Whole tensor operations",
            "Matrix multiplication, reductions, and connected operations expose larger opportunities.",
          ]}
        />
      );
    case 11:
      return (
        <Steps
          items={[
            [
              "Load",
              "Split the tensor into blocks. Load input and bias with edge masks.",
            ],
            [
              "Compute locally",
              "Add bias, then apply ReLU. Keep the intermediate in registers.",
            ],
            [
              "Store",
              "Write the final result once. More fusion can increase register pressure.",
            ],
          ]}
        />
      );
    case 12:
      return (
        <div className="traffic">
          <div>
            <span className="eyebrow">Separate kernels</span>
            <h3>
              <MathText tex="16N" /> <small>bytes</small>
            </h3>
            <div className="traffic-bar">
              <i />
              <i />
              <i />
              <i />
            </div>
            <p>Read input · write temporary · read temporary · write output</p>
          </div>
          <div className="green">
            <span className="eyebrow">One fused kernel</span>
            <h3>
              <MathText tex="8N" /> <small>bytes</small>
            </h3>
            <div className="traffic-bar fused">
              <i />
              <i />
            </div>
            <p>Read input · write output</p>
          </div>
          <p className="caution">
            FP32: <MathText tex="4N" /> bytes per access. Bias traffic excluded.
            Logical accesses, not measured HBM traffic or a promised speedup.
          </p>
        </div>
      );
    case 15:
      return (
        <>
          <Steps
            items={[
              [
                "Own an output tile",
                "Choose block dimensions and use strides to locate inputs.",
              ],
              [
                "Accumulate in chunks",
                "Load A and B blocks. Add dot products to local accumulators.",
              ],
              [
                "Store the finished tile",
                "Mask edges and write once after the reduction.",
              ],
            ]}
          />
          <p className="tradeoff">
            Larger tiles → more reuse{" "}
            <span>but more fast storage and potentially less parallelism.</span>
          </p>
        </>
      );
    case 17:
      return (
        <Steps
          items={[
            ["Prepare", "Warm up eligible work and arrange stable buffers."],
            [
              "Capture",
              "Record the GPU execution sequence with its constraints.",
            ],
            [
              "Replay",
              "Launch the prepared sequence with new inputs. Kernels compute new outputs.",
            ],
          ]}
        />
      );
    case 18:
      return (
        <div className="cost-table">
          <div className="table-head">
            <span>Mechanism</span>
            <span>Cost addressed</span>
            <span>What changes</span>
          </div>
          {[
            [
              "Fusion",
              "Temporary tensor traffic",
              "Keep intermediate values local",
            ],
            ["Tiling", "Repeated input loads", "Reuse loaded blocks"],
            [
              "Replay",
              "Host submission overhead",
              "Reuse a prepared execution sequence",
            ],
          ].map((row) => (
            <div className="table-row" key={row[0]}>
              {row.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          ))}
          <p className="caution">
            Start with a profiling hypothesis. These mechanisms can interact.
          </p>
        </div>
      );
    case 20:
      return (
        <>
          <Compare
            left={[
              "Narrow specialization",
              "Fixed assumptions",
              "Potentially simpler scheduling. New inputs may need another variant.",
            ]}
            right={[
              "Broader support",
              "Dynamic dimensions",
              "One program may handle a range of shapes, within constraints.",
            ]}
          />
          <p className="tradeoff">
            Shape bucketing{" "}
            <span>
              groups and pads lengths: extra arithmetic in exchange for fewer
              variants.
            </span>
          </p>
        </>
      );
    case 21:
      return (
        <div className="amdahl">
          <span className="eyebrow">An analytical example</span>
          <MathText display tex="0.5+\frac{0.5}{2}=0.75" />
          <p>Make half the runtime twice as fast.</p>
          <div className="runtime-bar">
            <span>Unchanged half</span>
            <span>Optimized half</span>
            <i />
          </div>
          <p className="green-text">
            <MathText tex="1/0.75\approx1.33\times" /> overall speedup
          </p>
          <p className="caution">
            Compile cost, spills, and finite search can outweigh savings.
          </p>
        </div>
      );
    case 22:
      return (
        <Compare
          left={[
            "A reusable compiler",
            "Facts it can establish",
            "Rules must hold across supported operators, shapes, and hardware.",
          ]}
          right={[
            "A domain expert",
            "Extra fixed structure",
            "A known topology or sparsity pattern may justify a specialized operator.",
          ]}
        />
      );
    case 23:
      return (
        <div className="experiment">
          <div className="code-label">PYTORCH · INFERENCE</div>
          <pre>
            <code>{`model.eval()\ncompiled_model = torch.compile(model)\n\nwith torch.inference_mode():\n    reference = model(example_input)\n    result = compiled_model(example_input)`}</code>
          </pre>
          <p className="caution">
            Assumes a loaded model, torch import, and supported device. Check
            outputs with workload-appropriate tolerances. Compilation is
            commonly lazy.
          </p>
        </div>
      );
    case 24:
      return (
        <div className="agent-prompt">
          <span className="eyebrow">A request with a measurement plan</span>
          <blockquote>
            Profile this inference path first. Try <code>torch.compile</code> on
            the repeated tensor computation. Keep model behavior and precision
            fixed. Compare correctness, cold-start cost, warm latency, and peak
            memory across representative shapes.
          </blockquote>
          <p>
            Retain the eager path. Report the environment and timing boundary.
          </p>
        </div>
      );
    case 25:
      return (
        <div className="diagnostics">
          {[
            [
              'TORCH_LOGS="graph_breaks,recompiles"',
              "Inspect graph breaks and new compiled variants. Set before launching Python.",
            ],
            [
              "fullgraph=True",
              "Require a single captured compiler graph. This does not mean a single kernel.",
            ],
            [
              "dynamic=True",
              "Attempt dynamic shape handling. Guards and constraints remain.",
            ],
            [
              'mode="reduce-overhead"',
              "Can use CUDA Graphs for eligible workloads.",
            ],
            [
              'mode="max-autotune"',
              "Spend additional compilation time selecting implementations.",
            ],
          ].map(([a, b]) => (
            <div key={a}>
              <code>{a}</code>
              <p>{b}</p>
            </div>
          ))}
        </div>
      );
    case 26:
      return (
        <Steps
          items={[
            [
              "Check behavior",
              "Same weights and precision. Compare outputs and relevant task metrics.",
            ],
            [
              "Separate cold & warm",
              "Warm both paths. Measure compile cost and repeat steady-state measurements.",
            ],
            [
              "Use the real workload",
              "Representative shapes, peak memory, and GPU-aware timing boundaries.",
            ],
          ]}
        />
      );
    case 27:
      return (
        <Links
          items={[
            [
              "Start with torch.compile",
              "Run the eager and compiled paths side by side.",
              sources.tutorial,
            ],
            [
              "Investigate one graph break",
              "Understand capture boundaries and recompilation.",
              sources.trouble,
            ],
            [
              "Explore Triton",
              "Begin with vector addition, then matrix multiplication.",
              sources.triton,
            ],
          ]}
        />
      );
    case 28:
      return (
        <Links
          items={[
            [
              "Inside the PyTorch compiler",
              "Capture, graph transformations, and lowering.",
              sources.paper,
            ],
            [
              "Understand GPU execution",
              "Memory, occupancy, and hardware constraints.",
              sources.cuda,
            ],
            [
              "Understand CUDA Graph Trees",
              "Replay, buffers, and memory interactions.",
              sources.graphs,
            ],
          ]}
        />
      );
    case 29:
      return (
        <div className="closing">
          <p className="big-question">
            Where is your model
            <br />
            <em>doing extra work?</em>
          </p>
          <div className="question-prompts">
            <span>What repeats?</span>
            <span>What changes?</span>
            <span>How will you measure it?</span>
          </div>
        </div>
      );
    case 30:
      return (
        <Compare
          left={[
            "Compiler operation graph",
            "What to compute",
            "Dependencies between tensor operations. One graph may lower to many kernels.",
          ]}
          right={[
            "CUDA execution graph",
            "How to submit it",
            "A captured sequence of kernels and other CUDA operations for replay.",
          ]}
        />
      );
    case 31:
      return (
        <dl className="glossary">
          {[
            ["Tensor", "An array of numbers; it can live on a CPU or GPU."],
            [
              "Kernel",
              "A program launched to do work on the GPU, not necessarily a model layer.",
            ],
            ["IR", "A structured representation of a program."],
            ["Lowering", "Moving toward forms closer to the target machine."],
            [
              "Guard",
              "A check that the assumptions of a compiled plan still hold.",
            ],
            [
              "Graph break",
              "A boundary around work the compiler cannot capture.",
            ],
          ].map(([a, b]) => (
            <div key={a}>
              <dt>{a}</dt>
              <dd>{b}</dd>
            </div>
          ))}
        </dl>
      );
    default:
      return null;
  }
}
