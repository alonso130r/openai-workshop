import { Fragment, type ReactNode } from "react";
import { MathText } from "./Math";

const urls = {
  tutorial:
    "https://docs.pytorch.org/tutorials/intermediate/torch_compile_tutorial.html",
  trouble:
    "https://docs.pytorch.org/docs/main/user_guide/torch_compiler/torch.compiler_troubleshooting.html",
  triton:
    "https://triton-lang.org/main/getting-started/tutorials/03-matrix-multiplication.html",
};

function Flow({ items }: { items: ReactNode[] }) {
  return (
    <div className="visual-flow">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span className="flow-arrow" aria-hidden="true">
              →
            </span>
          )}
          <div className="flow-node">{item}</div>
        </Fragment>
      ))}
    </div>
  );
}
function Checks({ items }: { items: string[] }) {
  return (
    <ol className="recap-checks">
      {items.map((item, i) => (
        <li key={item}>
          <span>{i + 1}</span>
          <p>{item}</p>
        </li>
      ))}
    </ol>
  );
}
function Access({
  children,
  removed = false,
}: {
  children: string;
  removed?: boolean;
}) {
  return (
    <span className={`access ${removed ? "removed" : ""}`}>{children}</span>
  );
}
function ReuseSketch() {
  return (
    <svg
      className="concept-sketch"
      viewBox="0 0 1000 330"
      role="img"
      aria-label="One loaded block of inputs contributes to several outputs"
    >
      <g fill="none" stroke="#58c4dd" strokeWidth="2">
        {[0, 1].flatMap((r) =>
          [0, 1].map((c) => (
            <rect
              key={`${r}-${c}`}
              x={150 + c * 65}
              y={90 + r * 65}
              width="60"
              height="60"
              fill="#58c4dd22"
            />
          )),
        )}
        <path d="M310 150C460 150 460 80 640 80M310 150C460 150 460 230 640 230" />
        <path d="M628 72l12 8-12 8M628 222l12 8-12 8" />
      </g>
      <g fill="#83c16722" stroke="#83c167" strokeWidth="2">
        <rect x="660" y="40" width="150" height="80" />
        <rect x="660" y="190" width="150" height="80" />
      </g>
      <g
        fill="#eee"
        fontFamily="KaTeX_Main, Georgia, serif"
        fontSize="27"
        textAnchor="middle"
      >
        <text x="215" y="280" fill="#58c4dd">
          One loaded block
        </text>
        <text x="735" y="90">
          Output 1
        </text>
        <text x="735" y="240">
          Output 2
        </text>
      </g>
    </svg>
  );
}

export function StaticVisual({ id }: { id: number }) {
  switch (id) {
    case 3:
      return (
        <div className="plan-recap">
          <div>
            <p className="diagram-label">Separate steps</p>
            <Flow
              items={[
                <MathText tex="x" />,
                "Add 3",
                "Temporary",
                "ReLU",
                <MathText tex="y" />,
              ]}
            />
          </div>
          <div>
            <p className="diagram-label green-text">Combined step</p>
            <Flow
              items={[
                <MathText tex="x" />,
                "Add 3 + ReLU",
                <MathText tex="y" />,
              ]}
            />
          </div>
          <p className="one-line">
            <MathText tex="y=[0,4,7]" /> in both cases.
          </p>
        </div>
      );
    case 4:
      return (
        <div className="single-diagram">
          <Flow items={["Your program", "Compiler", "Instructions"]} />
          <p className="one-line">The required behavior stays the same.</p>
        </div>
      );
    case 6:
      return (
        <div className="plan-recap">
          <div>
            <p className="diagram-label">Compile the program</p>
            <Flow items={["Program", "Compile", "Saved plan"]} />
          </div>
          <div>
            <p className="diagram-label green-text">Run the saved plan</p>
            <Flow items={["Input", "Saved plan", "Answer"]} />
          </div>
          <p className="one-line">Build beforehand, or on first use.</p>
        </div>
      );
    case 7:
      return (
        <div className="array-example">
          <div className="array-row">
            <MathText
              display
              tex={String.raw`\begin{bmatrix}-5&1&4&0\\2&-3&7&-8\\3&6&-1&9\end{bmatrix}`}
            />
            <span className="array-operation">
              Add 3<br />
              then ReLU<span aria-hidden="true">→</span>
            </span>
            <span className="green-text">
              <MathText
                display
                tex={String.raw`\begin{bmatrix}0&4&7&3\\5&0&10&0\\6&9&2&12\end{bmatrix}`}
              />
            </span>
          </div>
          <p className="one-line">An array of numbers is called a tensor.</p>
        </div>
      );
    case 11:
      return (
        <div className="single-diagram">
          <div className="kernel-enclosure">
            <p className="diagram-label">One GPU program</p>
            <Flow items={["Read input", "Add 3 + ReLU", "Write result"]} />
          </div>
          <p className="one-line">
            <MathText tex={String.raw`t=x+3,\quad y=\max(t,0)`} />
          </p>
          <p className="short-note">
            No separate tensor for <MathText tex="t" />.
          </p>
        </div>
      );
    case 12:
      return (
        <div className="access-comparison">
          <div className="access-row">
            <span className="diagram-label">Separate</span>
            <div>
              <Access>Read input</Access>
              <Access removed>Write temporary</Access>
              <Access removed>Read temporary</Access>
              <Access>Write output</Access>
            </div>
            <MathText tex="16N\;\text{bytes}" />
          </div>
          <div className="access-row fused">
            <span className="diagram-label">Fused</span>
            <div>
              <Access>Read input</Access>
              <Access>Write output</Access>
            </div>
            <MathText tex="8N\;\text{bytes}" />
          </div>
          <p className="short-note">
            <MathText tex="N" /> four-byte numbers; bias reads omitted. Logical
            counts, not timing.
          </p>
        </div>
      );
    case 15:
      return (
        <div className="single-diagram">
          <ReuseSketch />
          <p className="one-line">Larger blocks need more fast storage.</p>
        </div>
      );
    case 17:
      return (
        <div className="single-diagram">
          <Flow
            items={[
              "New inputs",
              <div>
                Prepared launches
                <div className="mini-kernels">
                  <i>K1</i>
                  <i>K2</i>
                  <i>K3</i>
                </div>
              </div>,
              "New answers",
            ]}
          />
          <p className="one-line">The GPU still does the calculations.</p>
        </div>
      );
    case 18:
      return (
        <div className="summary-rows">
          {[
            ["Fusion", "Avoid a separate temporary tensor."],
            ["Tiling", "Read the same inputs fewer times."],
            ["Replay", "Reduce gaps between launches."],
          ].map(([name, point]) => (
            <div key={name}>
              <h3>{name}</h3>
              <span aria-hidden="true">→</span>
              <p>{point}</p>
            </div>
          ))}
        </div>
      );
    case 20:
      return (
        <div className="shape-comparison">
          <div>
            <h3>One shape</h3>
            <MathText tex={String.raw`128\times256`} />
            <Flow items={["Input", "Plan A"]} />
          </div>
          <div>
            <h3>A range of shapes</h3>
            <MathText tex={String.raw`128\times256,\quad192\times256`} />
            <Flow items={["Either input", "Plan B"]} />
          </div>
          <p className="short-note">A single plan may support a range.</p>
        </div>
      );
    case 21:
      return (
        <div className="runtime-example">
          <div className="runtime-row">
            <span>Before</span>
            <div>
              <i className="unchanged">50</i>
              <i className="original-part">50</i>
            </div>
            <MathText tex="100" />
          </div>
          <div className="runtime-row">
            <span>After</span>
            <div>
              <i className="unchanged">50</i>
              <i className="improved-part">25</i>
              <i className="saved-part" />
            </div>
            <MathText tex="75" />
          </div>
          <p className="one-line">
            <MathText tex="2\times" /> faster in one half.{" "}
            <span className="green-text">
              <MathText tex="1.33\times" /> overall.
            </span>
          </p>
          <p className="short-note">Illustrative runtime, not a benchmark.</p>
        </div>
      );
    case 22:
      return (
        <div className="two-questions">
          <div>
            <p>Does it still apply?</p>
            <span>A check on the inputs.</span>
          </div>
          <div>
            <p>Is the full run faster?</p>
            <span>A measurement of the workload.</span>
          </div>
        </div>
      );
    case 23:
      return (
        <div className="experiment">
          <pre>
            <code>{`model.eval()\ncompiled_model = torch.compile(model)\n\nwith torch.inference_mode():\n    reference = model(example_input)\n    result = compiled_model(example_input)`}</code>
          </pre>
          <p className="short-note">Keep the original path for comparison.</p>
        </div>
      );
    case 24:
      return (
        <div className="agent-prompt">
          <blockquote>
            Profile first. Try <code>torch.compile</code> with the same behavior
            and precision. Compare answers, first-call cost, repeated runs, and
            memory.
          </blockquote>
        </div>
      );
    case 25:
      return (
        <div className="diagnostic-summary">
          <code>TORCH_LOGS="graph_breaks,recompiles"</code>
          <div className="two-questions">
            <div>
              <p>Graph break</p>
              <span>Some work was left outside compilation.</span>
            </div>
            <div>
              <p>Recompile</p>
              <span>A new plan was built.</span>
            </div>
          </div>
        </div>
      );
    case 26:
      return (
        <Checks
          items={[
            "Keep the model, inputs and precision fixed.",
            "Check answers before comparing speed.",
            "Separate first-call cost from repeated-call time.",
          ]}
        />
      );
    case 27:
      return (
        <div className="short-resources">
          {[
            ["Run the first example", urls.tutorial],
            ["Investigate one graph break", urls.trouble],
            ["Explore how kernels work", urls.triton],
          ].map(([label, url], i) => (
            <a href={url} target="_blank" rel="noreferrer" key={url}>
              <span>{i + 1}</span>
              {label}
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      );
    case 28:
      return (
        <div className="closing-summary">
          <Flow
            items={["Original model", "Compiled execution plan", "Equivalent results"]}
          />
          <div className="two-questions">
            <div>
              <p>Which work was avoided?</p>
            </div>
            <div>
              <p>Did total runtime decrease?</p>
            </div>
          </div>
        </div>
      );
    case 29:
      return (
        <div className="closing">
          <p className="big-question">Applying compilation to your workload</p>
          <div className="question-prompts">
            <span>Moving data</span>
            <span>Computing</span>
            <span>Waiting</span>
          </div>
        </div>
      );
    case 30:
      return (
        <div className="graph-comparison">
          <div>
            <h3>Compiler graph</h3>
            <Flow items={["Multiply", "Add", "ReLU"]} />
            <p className="one-line">Which calculations depend on which?</p>
          </div>
          <div>
            <h3>CUDA Graph</h3>
            <div className="mini-kernels">
              <i>K1</i>
              <i>K2</i>
              <i>K3</i>
            </div>
            <p className="one-line">Which GPU operations launch, and when?</p>
          </div>
        </div>
      );
    case 31:
      return (
        <dl className="glossary">
          {[
            ["Tensor", "An array of numbers."],
            ["Kernel", "A program launched on the GPU."],
            ["IR", "The compiler’s worksheet of operations."],
            ["Lowering", "Turning that worksheet into target instructions."],
            ["Guard", "A check that a saved plan still applies."],
            ["Graph break", "Work left outside the captured compiler graph."],
          ].map(([term, definition]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{definition}</dd>
            </div>
          ))}
        </dl>
      );
    default:
      return null;
  }
}
