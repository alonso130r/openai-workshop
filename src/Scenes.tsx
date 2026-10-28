import { memo, useEffect, useRef, useState } from "react";
import { ManimScene, Rectangle, Text } from "manim-react";
import { MathText } from "./Math";
const C = {
  blue: "#8bbcf4",
  green: "#c4ed88",
  orange: "#efb078",
  white: "#e9eae4",
  muted: "#8d978f",
  line: "#3b443b",
};
const W = 1440,
  H = 576;
const p = (x: number, y: number): [number, number, number] => [
  (x - W / 2) / 72,
  (H / 2 - y) / 72,
  0,
];
const Box = memo(function Box({
  x,
  y,
  w = 210,
  label,
  color = C.blue,
  sub = "",
}: {
  x: number;
  y: number;
  w?: number;
  label: string;
  color?: string;
  sub?: string;
}) {
  return (
    <>
      <Rectangle
        position={p(x, y)}
        width={w / 72}
        height={84 / 72}
        cornerRadius={0.16}
        style={{
          strokeColor: color,
          strokeWidth: 1.5,
          fillColor: "#1c2420",
          fillOpacity: 1,
        }}
      />
      <Text
        position={p(x, y - 3)}
        text={label}
        fontSize={23}
        fontFamily="Arial, sans-serif"
        style={{ fillColor: color }}
      />
      {sub && (
        <text x={x} y={y + 74} textAnchor="middle" fill={C.muted} fontSize="20">
          {sub}
        </text>
      )}
    </>
  );
});
function Label({
  x,
  y,
  children,
  color = C.muted,
  size = 22,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  color?: string;
  size?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      fill={color}
      fontSize={size}
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
    >
      {children}
    </text>
  );
}
function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = C.line,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
}) {
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g stroke={color} strokeWidth="2" fill="none">
      <path d={`M${x1},${y1} L${x2},${y2}`} />
      <path
        d="M-9,-6 L0,0 L-9,6"
        transform={`translate(${x2},${y2}) rotate(${angle})`}
      />
    </g>
  );
}
function Particle({
  x,
  y,
  color = C.blue,
}: {
  x: number;
  y: number;
  color?: string;
}) {
  return (
    <rect x={x - 7} y={y - 7} width="14" height="14" rx="3" fill={color} />
  );
}
const clamp = (x: number) => Math.max(0, Math.min(1, x));
function Intro({ t }: { t: number }) {
  const combined = t >= 0.58;
  const reveal = t > 0.18;
  const output = t > 0.36;
  return (
    <>
      <Label x={720} y={70} color={combined ? C.green : C.orange}>
        {combined ? "ONE COMBINED PLAN" : "SEPARATE OPERATIONS"}
      </Label>
      <Box x={220} y={245} label="[−5, 1, 4]" sub="Input" />
      {combined ? (
        <>
          <Box
            x={720}
            y={245}
            w={350}
            label="Add 3 + apply ReLU"
            color={C.green}
            sub="Intermediate stays local"
          />
          <Arrow x1={335} y1={245} x2={535} y2={245} />
          <Arrow x1={905} y1={245} x2={1090} y2={245} />
        </>
      ) : (
        <>
          <Box x={530} y={245} label="Add 3" color={C.orange} />
          <Box x={850} y={245} label="ReLU" color={C.orange} />
          <Arrow x1={335} y1={245} x2={415} y2={245} />
          <Arrow x1={645} y1={245} x2={735} y2={245} />
          <Arrow x1={965} y1={245} x2={1090} y2={245} />
          {reveal && (
            <Label x={690} y={365} color={C.orange}>
              [−2, 4, 7]
            </Label>
          )}
        </>
      )}
      {(output || combined) && (
        <Box x={1210} y={245} label="[0, 4, 7]" color={C.green} sub="Output" />
      )}
      <Label x={720} y={470} size={30} color={C.white}>
        {combined
          ? "Same output. No separate temporary tensor."
          : "ReLU replaces negative values with zero."}
      </Label>
    </>
  );
}
function Classic({ t }: { t: number }) {
  return (
    <>
      <Box x={250} y={200} w={280} label="Source program" />
      <Arrow x1={405} y1={200} x2={555} y2={200} />
      <Box x={720} y={200} w={300} label="Structured IR" color={C.orange} />
      <Arrow x1={885} y1={200} x2={1035} y2={200} />
      <Box x={1200} y={200} w={280} label="Target program" color={C.green} />
      {t > 0.2 && (
        <>
          <Label x={480} y={120}>
            Recognize structure
          </Label>
          <Label x={960} y={120}>
            Generate instructions
          </Label>
        </>
      )}
      {t > 0.4 && (
        <>
          <Label x={720} y={370} color={C.white} size={48}>
            {t > 0.7 ? "5" : "2 + 3"}
          </Label>
          <Label x={720} y={450}>
            {t > 0.7
              ? "Constant folding: replace fixed work during compilation."
              : "An expression whose inputs are already known."}
          </Label>
        </>
      )}
    </>
  );
}
function Memory({ t }: { t: number }) {
  const q = clamp((t - 0.15) / 0.65);
  return (
    <>
      <Box x={260} y={270} w={320} label="Device memory" sub="Large capacity" />
      <Box
        x={760}
        y={270}
        w={300}
        label="On-chip storage"
        color={C.orange}
        sub="Small working set"
      />
      <Box
        x={1210}
        y={270}
        w={240}
        label="Compute"
        color={C.green}
        sub="Use the values"
      />
      <Arrow x1={435} y1={270} x2={595} y2={270} />
      <Arrow x1={925} y1={270} x2={1075} y2={270} />
      {[0, 0.11, 0.22].map((delay, i) => {
        const f = clamp((q - delay) / (1 - delay));
        return f > 0 && f < 1 ? (
          <Particle
            key={i}
            x={435 + f * 640}
            y={270}
            color={i % 2 ? C.orange : C.blue}
          />
        ) : null;
      })}
      <Label x={720} y={460}>
        Registers, shared memory, and caches enable reuse. Paths are simplified.
      </Label>
    </>
  );
}
function Compiler({ t }: { t: number }) {
  return (
    <>
      <Label x={720} y={65}>
        CAPTURED OPERATION GRAPH
      </Label>
      {["Matmul", "Bias", "ReLU", "Output"].map((s, i) => (
        <Box
          key={s}
          x={210 + i * 340}
          y={190}
          w={225}
          label={s}
          color={i === 3 ? C.green : C.blue}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <Arrow
          key={i}
          x1={335 + i * 340}
          y1={190}
          x2={425 + i * 340}
          y2={190}
        />
      ))}
      {t > 0.35 && (
        <>
          <Arrow x1={210} y1={245} x2={210} y2={355} />
          <Box x={300} y={415} w={440} label="Library or generated matmul" />
        </>
      )}
      {t > 0.65 && (
        <>
          <Arrow x1={720} y1={245} x2={720} y2={355} />
          <Box
            x={920}
            y={415}
            w={510}
            label="Fused elementwise kernel"
            color={C.green}
          />
        </>
      )}
      <Label x={720} y={545}>
        One possible lowering. Actual kernel arrangements vary.
      </Label>
    </>
  );
}
function Fusion({ t }: { t: number }) {
  const fused = t > 0.53;
  const xs = fused ? [180, 720, 1260] : [140, 420, 720, 1000, 1300];
  const labels = fused
    ? ["Input", "Bias + ReLU", "Output"]
    : ["Input", "Bias +", "Temporary", "ReLU", "Output"];
  const f = fused ? clamp((t - 0.55) / 0.32) : clamp(t / 0.4);
  return (
    <>
      <Label x={720} y={80} color={fused ? C.green : C.orange}>
        {fused ? "ONE FUSED KERNEL" : "SEPARATE KERNELS"}
      </Label>
      {labels.map((s, i) => (
        <Box
          key={s}
          x={xs[i]}
          y={250}
          w={fused && i === 1 ? 350 : 200}
          label={s}
          color={
            i === labels.length - 1
              ? C.green
              : s === "Temporary"
                ? C.orange
                : C.blue
          }
          sub={s === "Temporary" ? "Global store + reload" : ""}
        />
      ))}
      {xs.slice(0, -1).map((x, i) => (
        <Arrow key={i} x1={x + 110} y1={250} x2={xs[i + 1] - 110} y2={250} />
      ))}
      {f > 0 && f < 1 && (
        <Particle
          x={xs[0] + f * (xs.at(-1)! - xs[0])}
          y={250}
          color={fused ? C.green : C.orange}
        />
      )}
      <Label x={720} y={455} size={28} color={C.white}>
        {fused
          ? "The temporary stays local to the kernel."
          : "Arithmetic is unchanged. The temporary tensor makes a round trip."}
      </Label>
      {!fused && t > 0.2 && (
        <Label x={720} y={510}>
          Independent scalar example: −2 + 3 = 1
        </Label>
      )}
    </>
  );
}
function Matrix({
  x,
  y,
  values,
  color,
  highlight,
}: {
  x: number;
  y: number;
  values: number[][];
  color: string;
  highlight: (r: number, c: number) => boolean;
}) {
  const n = values.length,
    size = n === 2 ? 82 : 55;
  return (
    <>
      {values.flatMap((row, r) =>
        row.map((value, c) => (
          <g key={`${r}-${c}`}>
            <rect
              x={x + c * size}
              y={y + r * size}
              width={size - 5}
              height={size - 5}
              rx="5"
              fill={highlight(r, c) ? color : "#1d241e"}
              fillOpacity={highlight(r, c) ? 0.25 : 1}
              stroke={highlight(r, c) ? color : C.line}
            />
            {n === 2 && (
              <Label
                x={x + c * size + (size - 5) / 2}
                y={y + r * size + size / 2 + 5}
                color={highlight(r, c) ? color : C.white}
                size={30}
              >
                {value}
              </Label>
            )}
          </g>
        )),
      )}
    </>
  );
}
function DotProduct({ t }: { t: number }) {
  const col = t > 0.55 ? 1 : 0,
    show = t > 0.22;
  return (
    <>
      <Label x={325} y={100} color={C.blue}>
        A
      </Label>
      <Label x={710} y={100} color={C.blue}>
        B
      </Label>
      <Label x={1095} y={100} color={C.green}>
        AB
      </Label>
      <Matrix
        x={245}
        y={155}
        values={[
          [1, 2],
          [3, 4],
        ]}
        color={C.blue}
        highlight={(r) => show && r === 0}
      />
      <Label x={515} y={250} size={35}>
        ×
      </Label>
      <Matrix
        x={630}
        y={155}
        values={[
          [5, 6],
          [7, 8],
        ]}
        color={C.blue}
        highlight={(_, c) => show && c === col}
      />
      <Label x={900} y={250} size={35}>
        =
      </Label>
      <Matrix
        x={1015}
        y={155}
        values={[
          [19, 22],
          [43, 50],
        ]}
        color={C.green}
        highlight={(r, c) => show && r === 0 && c === col}
      />
      {show && (
        <Label x={720} y={425} color={C.white} size={34}>
          {col ? "1 × 6 + 2 × 8 = 22" : "1 × 5 + 2 × 7 = 19"}
        </Label>
      )}
      <Label x={720} y={510}>
        {col
          ? "The same row contributes again."
          : "Each result is a row-by-column dot product."}
      </Label>
    </>
  );
}
function Tiling({ t }: { t: number }) {
  const second = t > 0.55;
  const n = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  const f = second ? clamp((t - 0.6) / 0.28) : clamp((t - 0.18) / 0.25);
  return (
    <>
      <Label x={290} y={80} color={C.blue}>
        A · input block
      </Label>
      <Label x={705} y={80} color={C.blue}>
        B · input block
      </Label>
      <Label x={1120} y={80} color={C.green}>
        Output tile
      </Label>
      <Matrix
        x={180}
        y={130}
        values={n}
        color={C.blue}
        highlight={(r, c) => t > 0.1 && r < 2 && (second ? c >= 2 : c < 2)}
      />
      <Matrix
        x={595}
        y={130}
        values={n}
        color={C.blue}
        highlight={(r, c) => t > 0.1 && c < 2 && (second ? r >= 2 : r < 2)}
      />
      <Matrix
        x={1010}
        y={130}
        values={n}
        color={C.green}
        highlight={(r, c) => t > 0.18 && r < 2 && c < 2}
      />
      <Arrow x1={420} y1={240} x2={555} y2={240} />
      <Arrow x1={835} y1={240} x2={975} y2={240} />
      {f > 0 && f < 1 && (
        <>
          <rect
            x={(second ? 290 : 180) + f * (1010 - (second ? 290 : 180))}
            y={130}
            width="105"
            height="105"
            rx="5"
            fill={C.blue}
            opacity=".45"
          />
          <rect
            x={595 + f * 415}
            y={(second ? 240 : 130) + f * (130 - (second ? 240 : 130))}
            width="105"
            height="105"
            rx="5"
            fill={C.blue}
            opacity=".45"
          />
        </>
      )}
      <Label x={720} y={440} color={C.white} size={29}>
        {t > 0.9
          ? "Accumulate partial sums. Write the final output once."
          : second
            ? "Next reduction chunk → same output tile"
            : "Load blocks → update local accumulators"}
      </Label>
      <Label x={720} y={510}>
        Blocks represent contributions, not input values overwriting the output.
      </Label>
    </>
  );
}
function Replay({ t }: { t: number }) {
  return (
    <>
      <Label x={720} y={60}>
        SCHEMATIC TIMELINE · NOT MEASURED TIMING
      </Label>
      {[0, 1].map((row) => (
        <g key={row}>
          <Label x={235} y={180 + row * 220} color={row ? C.green : C.orange}>
            {row ? "Graph replay" : "Repeated launches"}
          </Label>
          <line
            x1="420"
            y1={230 + row * 220}
            x2="1350"
            y2={230 + row * 220}
            stroke={C.line}
          />
          {[0, 1, 2, 3].map((i) =>
            t > (row ? 0.45 : 0) + i * 0.075 ? (
              <g key={i}>
                <rect
                  x={440 + i * (row ? 165 : 225)}
                  y={155 + row * 220}
                  width="140"
                  height="65"
                  rx="7"
                  fill={row ? "#33452a" : "#4b3524"}
                  stroke={row ? C.green : C.orange}
                />
                <Label
                  x={510 + i * (row ? 165 : 225)}
                  y={195 + row * 220}
                  color={row ? C.green : C.orange}
                >
                  K{i + 1}
                </Label>
              </g>
            ) : null,
          )}
        </g>
      ))}
      <Label x={720} y={540}>
        Equal kernel widths. Smaller submission gaps; the arithmetic is not
        faster.
      </Label>
    </>
  );
}
function Guards({ t }: { t: number }) {
  const fail = t > 0.6;
  const f = clamp(t / 0.5);
  return (
    <>
      <Box
        x={230}
        y={200}
        w={300}
        label={fail ? "192 × 256" : "128 × 256"}
        sub="Request shape"
      />
      <Arrow x1={395} y1={200} x2={550} y2={200} />
      <Box
        x={720}
        y={200}
        w={300}
        label={fail ? "Assumption fails" : "Guard passes"}
        color={fail ? C.orange : C.green}
      />
      <g opacity={fail ? 0.25 : 1}>
        <Arrow x1={885} y1={200} x2={1045} y2={200} />
        <Box x={1220} y={200} w={300} label="Compiled plan A" color={C.green} />
      </g>
      {!fail &&
        [0, 0.2].map((d, i) => {
          const q = clamp((f - d) / 0.8);
          return q > 0 && q < 1 ? (
            <Particle key={i} x={395 + q * 650} y={200} color={C.green} />
          ) : null;
        })}
      {fail && (
        <>
          <Arrow x1={720} y1={255} x2={720} y2={355} color={C.orange} />
          <Box
            x={720}
            y={415}
            w={400}
            label="Compile another plan B"
            color={C.orange}
          />
        </>
      )}
      <Label x={720} y={540}>
        A static-shape example. Dynamic shapes can sometimes reuse one program.
      </Label>
    </>
  );
}
const scenes: Record<string, React.ComponentType<{ t: number }>> = {
  IntroExample: Intro,
  ClassicCompiler: Classic,
  Memory,
  Compiler,
  Fusion,
  DotProduct,
  Tiling,
  Replay,
  Guards,
};
const equations: Record<string, string> = {
  IntroExample: String.raw`y=\max(x+3,0)`,
  ClassicCompiler: String.raw`2+3\longrightarrow5`,
  Memory: String.raw`\text{load}\rightarrow\text{reuse}\rightarrow\text{compute}`,
  Compiler: String.raw`y=\operatorname{ReLU}(xW+b)`,
  Fusion: String.raw`\max(x+b,0)`,
  DotProduct: String.raw`C_{ij}=\sum_k A_{ik}B_{kj}`,
  Tiling: String.raw`C_{\text{tile}}\mathrel{+}=A_{\text{block}}B_{\text{block}}`,
  Replay: String.raw`\text{same kernels}+\text{less submission work}`,
  Guards: String.raw`\text{reuse}\iff\text{assumptions hold}`,
};
export default function ScenePlayer({
  name,
  active,
}: {
  name: string;
  active: boolean;
}) {
  const [time, setTime] = useState(0),
    [playing, setPlaying] = useState(false),
    [motionEnabled, setMotionEnabled] = useState(false);
  const stamp = useRef(0);
  const duration = 14;
  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);
  useEffect(() => {
    if (!playing) return;
    let frame: number;
    stamp.current = performance.now();
    const tick = (now: number) => {
      const delta = (now - stamp.current) / 1000;
      stamp.current = now;
      setTime((previous) => {
        const next = Math.min(duration, previous + delta);
        if (next === duration) setPlaying(false);
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);
  const Component = scenes[name];
  const reduced =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !motionEnabled;
  return (
    <div className="scene-player" data-scene={name} data-time={time.toFixed(2)}>
      <div className="scene-pan-hint">
        Swipe the diagram horizontally to explore the full plan →
      </div>
      <div
        className="scene-canvas"
        role="img"
        aria-label={`${name} schematic animation, ${Math.round((time / duration) * 100)} percent complete`}
      >
        <ManimScene
          width={W}
          height={H}
          frameWidth={20}
          frameHeight={8}
          showControls={false}
          autoPlay={false}
          backgroundColor="#131a15"
          style={{ width: "100%", height: "100%" }}
        >
          <Component t={time / duration} />
        </ManimScene>
      </div>
      <div className="scene-toolbar">
        <div className="playback">
          <button
            className="play-button"
            aria-label={
              playing
                ? "Pause animation"
                : time >= duration
                  ? "Replay animation"
                  : "Play animation"
            }
            onClick={() => {
              if (reduced) {
                setTime(duration);
                return;
              }
              if (time >= duration) setTime(0);
              setPlaying(!playing);
            }}
          >
            {playing ? "Pause" : time >= duration ? "Replay" : "Play scene"}{" "}
            <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>
          </button>
          <button
            aria-label="Reset animation"
            onClick={() => {
              setPlaying(false);
              setTime(0);
            }}
          >
            ↺
          </button>
        </div>
        <input
          aria-label="Animation progress"
          type="range"
          min="0"
          max={duration}
          step="0.01"
          value={time}
          onChange={(e) => {
            setPlaying(false);
            setTime(Number(e.target.value));
          }}
        />
        <span className="scene-time">
          {time.toFixed(0).padStart(2, "0")} / {duration}s
        </span>
        <MathText tex={equations[name]} />
      </div>
      {reduced && (
        <div className="motion-note">
          <span>Reduced motion: explore each step with the slider.</span>
          <button onClick={() => setMotionEnabled(true)}>
            Enable animation
          </button>
        </div>
      )}
    </div>
  );
}
