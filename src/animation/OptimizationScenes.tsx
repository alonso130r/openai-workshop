import {
  C,
  Node,
  Arrow,
  Label,
  Tex,
  Fade,
  Packet,
  Matrix,
  Caption,
  Brace,
} from "./Primitives";
import { progress as p, interpolate as mix } from "./timeline.mjs";

export function Fusion({ t }: { t: number }) {
  const join = p(t, 16, 20),
    ax = mix(425, 630, join),
    rx = mix(1005, 810, join),
    local = p(t, 21, 23);
  return (
    <>
      <g opacity={1 - join}>
        <Label x={720} y={75} size={34} color={C.orange}>
          Separate kernels
        </Label>
      </g>
      <g opacity={join}>
        <Label x={720} y={75} size={34} color={C.green}>
          One fused kernel
        </Label>
      </g>
      <Node x={150} y={235} w={190} label="Input" draw={p(t, 0, 0.7)} />
      <Node
        x={1290}
        y={235}
        w={190}
        label="Output"
        color={C.green}
        draw={p(t, 0, 0.7)}
      />
      <g opacity={1 - join}>
        <Node x={ax} y={235} w={190} label="Add bias" draw={p(t, 0.5, 1.3)} />
        <Node x={rx} y={235} w={190} label="ReLU" draw={p(t, 1, 1.8)} />
        <Node
          x={720}
          y={235}
          w={190}
          label="Temporary"
          color={C.orange}
          draw={p(t, 0.8, 1.7)}
        />
        {[0, 1, 2, 3].map((i) => (
          <Arrow
            key={i}
            x1={[260, 535, 830, 1115][i]}
            y1={235}
            x2={[315, 610, 895, 1180][i]}
            y2={235}
            draw={p(t, 1 + i * 0.3, 2 + i * 0.3)}
          />
        ))}
        <Fade t={t} at={6.5}>
          <Tex
            x={720}
            y={380}
            tex={String.raw`\text{write temporary}\quad\downarrow`}
            color={C.orange}
            size={32}
          />
        </Fade>
        <Fade t={t} at={10}>
          <Tex
            x={720}
            y={450}
            tex={String.raw`\text{read temporary}\quad\uparrow`}
            color={C.orange}
            size={32}
          />
        </Fade>
      </g>
      {[
        { a: 2.5, b: 4.8, x: 150, z: 425, value: "−2", color: C.blue },
        { a: 5, b: 7.5, x: 425, z: 720, value: "1", color: C.orange },
        { a: 9, b: 11.5, x: 720, z: 1005, value: "1", color: C.orange },
        { a: 12, b: 14, x: 1005, z: 1290, value: "1", color: C.green },
      ].map((v, i) => {
        const q = p(t, v.a, v.b);
        return (
          <Packet
            key={i}
            x={mix(v.x, v.z, q)}
            y={235 - Math.sin(q * Math.PI) * 100}
            value={v.value}
            color={v.color}
            opacity={p(t, v.a, v.a + 0.3) * (1 - p(t, v.b - 0.25, v.b))}
          />
        );
      })}
      <Fade t={t} at={3.5} until={15}>
        <Tex x={425} y={390} size={40} tex="-2+3=1" />
      </Fade>
      <g opacity={join}>
        <Node
          x={720}
          y={235}
          w={mix(700, 470, join)}
          h={110}
          tex={String.raw`\max(x_i+3,0)`}
          color={C.green}
          draw={join}
        />
        <Arrow x1={265} y1={235} x2={465} y2={235} color={C.blue} draw={join} />
        <Arrow
          x1={975}
          y1={235}
          x2={1180}
          y2={235}
          color={C.green}
          draw={join}
        />
        <Tex
          x={720}
          y={390}
          tex={String.raw`[-2,4,7]\quad\text{in registers}`}
          color={C.orange}
          size={34}
        />
        <Label x={720} y={455} color={C.muted} size={27}>
          load input → compute locally → store output
        </Label>
      </g>
      {[-5, 1, 4].map((value, i) => {
        const start = 20 + i * 0.5,
          end = 23 + i * 0.5,
          q = p(t, start, end);
        return (
          <Packet
            key={`fused-${i}`}
            x={mix(150, 1290, q)}
            y={235 - Math.sin(q * Math.PI) * 90}
            value={String(q < 0.5 ? value : Math.max(0, value + 3))}
            color={q < 0.5 ? C.blue : C.green}
            opacity={p(t, start, start + 0.25) * (1 - p(t, end - 0.25, end))}
          />
        );
      })}
      <g opacity={local}>
        <Tex x={315} y={550} size={42} color={C.blue} tex="[-5,1,4]" />
        <Arrow
          x1={500}
          y1={550}
          x2={945}
          y2={550}
          color={C.green}
          draw={local}
        />
        <Tex x={1120} y={550} size={42} color={C.green} tex="[0,4,7]" />
      </g>
      <Caption t={t} at={23.5}>
        Remove a global-memory write and read. Keep the arithmetic.
      </Caption>
    </>
  );
}

export function DotProduct({ t }: { t: number }) {
  const select = p(t, 2, 4),
    column = p(t, 15, 17),
    first = p(t, 10, 12),
    second = p(t, 21, 23);
  const A = [
      [1, 2],
      [3, 4],
    ],
    B = [
      [5, 6],
      [7, 8],
    ],
    O = [
      [19, 22],
      [43, 50],
    ];
  return (
    <>
      <Label x={270} y={110} color={C.blue}>
        A
      </Label>
      <Label x={720} y={110} color={C.blue}>
        B
      </Label>
      <Label x={1170} y={110} color={C.green}>
        AB
      </Label>
      <Matrix
        x={180}
        y={170}
        cell={90}
        values={A}
        highlight={(r) => (r === 0 ? select * 0.85 : 0)}
      />
      <Tex x={490} y={260} tex="\times" size={45} />
      <Matrix
        x={630}
        y={170}
        cell={90}
        values={B}
        highlight={(_, c) => select * 0.85 * (c === 0 ? 1 - column : column)}
      />
      <Tex x={940} y={260} tex="=" size={45} />
      <Matrix
        x={1080}
        y={170}
        cell={90}
        values={O}
        color={C.green}
        highlight={(r, c) =>
          r === 0 ? (c === 0 ? first * (1 - column) : second) : 0
        }
      />
      <g opacity={1 - column}>
        <Fade t={t} at={6.5}>
          <Tex
            x={720}
            y={490}
            tex={String.raw`\color{#58c4dd}{1}\cdot5+\color{#58c4dd}{2}\cdot7=\color{#83c167}{19}`}
            size={48}
          />
        </Fade>
      </g>
      <g opacity={column}>
        <Tex
          x={720}
          y={490}
          tex={String.raw`\color{#58c4dd}{1}\cdot6+\color{#58c4dd}{2}\cdot8=\color{#83c167}{22}`}
          size={48}
        />
      </g>
      {[
        { v: "1", x: 225, y: 215, z: 400, d: 0 },
        { v: "5", x: 675, y: 215, z: 510, d: 0.3 },
        { v: "2", x: 315, y: 215, z: 700, d: 0.6 },
        { v: "7", x: 675, y: 305, z: 810, d: 0.9 },
      ].map((v, i) => {
        const q = p(t, 4 + v.d, 6.4 + v.d);
        return (
          <Packet
            key={i}
            x={mix(v.x, v.z, q)}
            y={mix(v.y, 435, q) - Math.sin(q * Math.PI) * 40}
            value={v.v}
            opacity={
              p(t, 4 + v.d, 4.3 + v.d) * (1 - p(t, 6.1 + v.d, 6.4 + v.d))
            }
          />
        );
      })}
      {[
        { v: "19", start: 10, end: 12, x: 1125 },
        { v: "22", start: 21, end: 23, x: 1215 },
      ].map((v) => {
        const q = p(t, v.start, v.end);
        return (
          <Packet
            key={v.v}
            x={mix(1035, v.x, q)}
            y={mix(490, 215, q) - Math.sin(q * Math.PI) * 70}
            value={v.v}
            color={C.green}
            opacity={
              p(t, v.start, v.start + 0.3) * (1 - p(t, v.end - 0.2, v.end))
            }
          />
        );
      })}
      <Brace
        x1={180}
        x2={360}
        y={385}
        label="same row"
        color={C.blue}
        amount={p(t, 14, 15.5)}
      />
      <Caption t={t} at={23.5}>
        The same input row contributes to another output.
      </Caption>
    </>
  );
}

const A = Array.from({ length: 4 }, (_, r) =>
  Array.from({ length: 4 }, (_, c) => r * 4 + c + 1),
);
const B = A;
const product = (r: number, c: number, start: number, end: number) =>
  A[r].slice(start, end).reduce((s, v, k) => s + v * B[start + k][c], 0);
function Block({
  x,
  y,
  values,
  opacity,
  scale = 1,
}: {
  x: number;
  y: number;
  values: number[][];
  opacity: number;
  scale?: number;
}) {
  return (
    <g opacity={opacity} transform={`translate(${x},${y}) scale(${scale})`}>
      {values.flatMap((row, r) =>
        row.map((v, c) => (
          <g key={`${r}-${c}`}>
            <rect
              x={c * 58}
              y={r * 58}
              width={55}
              height={55}
              fill="#000"
              stroke={C.blue}
              strokeWidth={2}
            />
            <text
              x={c * 58 + 27.5}
              y={r * 58 + 29}
              fill={C.blue}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="KaTeX_Main, Georgia, serif"
              fontSize={29}
            >
              {v}
            </text>
          </g>
        )),
      )}
    </g>
  );
}
export function Tiling({ t }: { t: number }) {
  const select = p(t, 2, 4),
    chunk = p(t, 15, 17),
    sum0 = p(t, 10, 12),
    sum1 = p(t, 22, 24),
    write = p(t, 25, 27);
  const Cvalues = A.map((row, r) =>
    row.map((_, c) =>
      r < 2 && c < 2
        ? Math.round(product(r, c, 0, 2) * sum0 + product(r, c, 2, 4) * sum1)
        : "·",
    ),
  );
  return (
    <>
      <Label x={280} y={80} color={C.blue}>
        A
      </Label>
      <Label x={720} y={80} color={C.blue}>
        B
      </Label>
      <Label x={1160} y={80} color={C.green}>
        Output
      </Label>
      <Matrix
        x={150}
        y={135}
        values={A}
        cell={65}
        highlight={(r, c) => (r < 2 ? select * (c < 2 ? 1 - chunk : chunk) : 0)}
      />
      <Tex x={500} y={260} tex="\times" size={39} />
      <Matrix
        x={590}
        y={135}
        values={B}
        cell={65}
        highlight={(r, c) => (c < 2 ? select * (r < 2 ? 1 - chunk : chunk) : 0)}
      />
      <Tex x={940} y={260} tex="=" size={39} />
      <Matrix
        x={1030}
        y={135}
        values={Cvalues}
        cell={65}
        color={C.green}
        highlight={(r, c) =>
          r < 2 && c < 2 ? select * (0.55 + write * 0.45) : 0
        }
      />
      {[0, 1].map((k) => {
        const start = k ? 18 : 6,
          end = k ? 22 : 10,
          q = p(t, start, end),
          opacity = p(t, start, start + 0.4) * (1 - p(t, end - 0.4, end));
        return (
          <g key={k}>
            <Block
              x={mix(k ? 280 : 150, 1010, q)}
              y={135 + Math.sin(q * Math.PI) * 270}
              values={A.slice(0, 2).map((row) => row.slice(k * 2, k * 2 + 2))}
              opacity={opacity}
              scale={mix(1, 0.6, q)}
            />
            <Block
              x={mix(590, 1130, q)}
              y={mix(k ? 265 : 135, 135, q) + Math.sin(q * Math.PI) * 270}
              values={B.slice(k * 2, k * 2 + 2).map((row) => row.slice(0, 2))}
              opacity={opacity}
              scale={mix(1, 0.6, q)}
            />
          </g>
        );
      })}
      <Fade t={t} at={4}>
        <Tex
          x={720}
          y={485}
          size={40}
          color={C.green}
          tex={String.raw`C_{\mathrm{tile}}\mathrel{+}=A_{\mathrm{block}}B_{\mathrm{block}}`}
        />
      </Fade>
      <g opacity={1 - chunk}>
        <Fade t={t} at={11}>
          <Tex
            x={720}
            y={565}
            tex={String.raw`C_{00}=1\cdot1+2\cdot5=11`}
            size={33}
          />
        </Fade>
      </g>
      <g opacity={chunk}>
        <Tex
          x={720}
          y={565}
          tex={String.raw`C_{00}=11+3\cdot9+4\cdot13=90`}
          size={33}
        />
      </g>
      <Caption t={t} at={25}>
        Accumulate locally, then write the completed output tile.
      </Caption>
    </>
  );
}

export function Replay({ t }: { t: number }) {
  const compact = p(t, 13, 17);
  return (
    <>
      <Label x={720} y={65} size={25} color={C.muted}>
        Schematic timeline · not measured timing
      </Label>
      <Label x={220} y={230} color={C.blue} size={29}>
        Repeated launches
      </Label>
      <Label x={220} y={480} color={C.green} size={29}>
        Graph replay
      </Label>
      {[220, 470].map((y) => (
        <path
          key={y}
          d={`M400,${y + 45}H1360`}
          stroke={C.line}
          fill="none"
          strokeWidth={1.5}
        />
      ))}
      {[0, 1, 2, 3].map((i) => {
        const show = p(t, 1.8 + i * 1.1, 2.7 + i * 1.1),
          copy = p(t, 10 + i * 0.5, 12 + i * 0.5),
          x = 400 + i * 225,
          lx = mix(x, 400 + i * 165, compact),
          ly = mix(220, 470, copy);
        return (
          <g key={i}>
            <g opacity={show}>
              <rect
                x={x}
                y={185}
                width={140}
                height={70}
                rx={3}
                fill={C.blue}
                fillOpacity={0.13}
                stroke={C.blue}
                strokeWidth={2}
              />
              <Label x={x + 70} y={220} color={C.blue}>
                K{i + 1}
              </Label>
            </g>
            {i < 3 && (
              <g opacity={p(t, 6, 7.5)}>
                <path
                  d={`M${x + 144},292H${x + 221}`}
                  stroke={C.orange}
                  strokeWidth={4}
                />
                <path
                  d={`M${x + 144},284v16M${x + 221},284v16`}
                  stroke={C.orange}
                />
              </g>
            )}
            <g opacity={p(t, 10 + i * 0.5, 10.5 + i * 0.5)}>
              <rect
                x={lx}
                y={ly - 35}
                width={140}
                height={70}
                rx={3}
                fill={C.green}
                fillOpacity={0.13}
                stroke={C.green}
                strokeWidth={2}
              />
              <Label x={lx + 70} y={ly} color={C.green}>
                K{i + 1}
              </Label>
            </g>
          </g>
        );
      })}
      <Fade t={t} at={7}>
        <Label x={820} y={345} color={C.orange} size={27}>
          submission gaps
        </Label>
      </Fade>
      <Fade t={t} at={17}>
        <Brace
          x1={400}
          x2={1035}
          y={550}
          label="same kernels, smaller gaps"
          color={C.green}
        />
      </Fade>
      <Caption t={t} at={19}>
        Replay changes submission overhead, not kernel arithmetic.
      </Caption>
    </>
  );
}

export function Guards({ t }: { t: number }) {
  const change = p(t, 11, 13),
    fail = p(t, 14, 16);
  return (
    <>
      <g opacity={1 - change}>
        <Node
          x={210}
          y={240}
          w={300}
          tex={String.raw`128\times256`}
          draw={p(t, 0, 0.8)}
        />
      </g>
      <g opacity={change}>
        <Node
          x={210}
          y={240}
          w={300}
          tex={String.raw`192\times256`}
          color={C.blue}
          draw={change}
        />
      </g>
      <Label x={210} y={140} color={C.blue} size={28}>
        Request shape
      </Label>
      <Arrow x1={380} y1={240} x2={550} y2={240} draw={p(t, 1, 2.5)} />
      <Node
        x={720}
        y={240}
        w={300}
        label="Guard check"
        color={`rgb(${Math.round(mix(238, 255, fail))},${Math.round(mix(238, 134, fail))},${Math.round(mix(238, 47, fail))})`}
        draw={p(t, 1.5, 3)}
      />
      <g opacity={1 - fail * 0.8}>
        <Arrow
          x1={890}
          y1={240}
          x2={1050}
          y2={240}
          color={C.green}
          draw={p(t, 3, 4)}
        />
        <Node
          x={1210}
          y={240}
          w={300}
          label="Compiled plan A"
          color={C.green}
          draw={p(t, 3, 4.3)}
        />
      </g>
      <g opacity={p(t, 3, 4) * (1 - fail)}>
        <Tex
          x={720}
          y={365}
          tex={String.raw`\text{shape matches}\;\checkmark`}
          color={C.green}
          size={32}
        />
      </g>
      <g opacity={fail}>
        <Tex
          x={720}
          y={365}
          tex={String.raw`\text{static assumption fails}`}
          color={C.orange}
          size={30}
        />
      </g>
      {[0, 1].map((i) => {
        const start = i ? 7 : 3.8,
          end = i ? 10 : 6.8,
          q = p(t, start, end);
        return (
          <Packet
            key={i}
            x={mix(380, 1060, q)}
            y={240}
            value="128"
            color={C.green}
            opacity={p(t, start, start + 0.3) * (1 - p(t, end - 0.3, end))}
          />
        );
      })}
      <Fade t={t} at={4.5} until={13}>
        <Label x={720} y={440} color={C.muted} size={26}>
          dtype · device · strides · relevant program state
        </Label>
      </Fade>
      <Arrow
        x1={720}
        y1={405}
        x2={720}
        y2={485}
        color={C.orange}
        draw={p(t, 16, 18)}
      />
      <Node
        x={720}
        y={550}
        w={480}
        label="Compile another variant: plan B"
        color={C.orange}
        draw={p(t, 18, 20)}
      />
      <Caption t={t} at={21}>
        Dynamic shapes can sometimes reuse a single program.
      </Caption>
    </>
  );
}
