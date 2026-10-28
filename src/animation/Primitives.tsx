import { Children, memo, type ReactNode } from "react";
import { Rectangle, Text, MathTex } from "manim-react";
import { progress, interpolate as mix } from "./timeline.mjs";

export const C = {
  blue: "#58c4dd",
  blueLight: "#9cdceb",
  green: "#83c167",
  yellow: "#ffff00",
  orange: "#ff862f",
  white: "#eeeeee",
  muted: "#999999",
  line: "#666666",
  purple: "#b189c6",
};
export const W = 1440,
  H = 720;
const position = (x: number, y: number): [number, number, number] => [
  (x - W / 2) / 72,
  (H / 2 - y) / 72,
  0,
];

export const Label = memo(function Label({
  x,
  y,
  children,
  color = C.white,
  size = 32,
}: {
  x: number;
  y: number;
  children: ReactNode;
  color?: string;
  size?: number;
}) {
  return (
    <Text
      position={position(x, y)}
      text={Children.toArray(children).join("")}
      fontSize={size}
      fontFamily="KaTeX_Main, Georgia, serif"
      style={{ fillColor: color }}
    />
  );
});
export const Tex = memo(function Tex({
  x,
  y,
  tex,
  color = C.white,
  size = 35,
}: {
  x: number;
  y: number;
  tex: string;
  color?: string;
  size?: number;
}) {
  return (
    <MathTex
      position={position(x, y)}
      formula={tex}
      fontSize={size}
      color={color}
      displayMode={false}
    />
  );
});
export function Fade({
  t,
  at = 0,
  until = Infinity,
  span = 0.85,
  children,
  dy = 12,
}: {
  t: number;
  at?: number;
  until?: number;
  span?: number;
  children: ReactNode;
  dy?: number;
}) {
  const a = progress(t, at, at + span),
    b = until === Infinity ? 1 : 1 - progress(t, until, until + span);
  return (
    <g opacity={a * b} transform={`translate(0,${(1 - a) * dy})`}>
      {children}
    </g>
  );
}
export function Node({
  x,
  y,
  w = 230,
  h = 92,
  label,
  tex,
  color = C.blue,
  draw = 1,
  sub,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  label?: string;
  tex?: string;
  color?: string;
  draw?: number;
  sub?: string;
}) {
  return (
    <>
      <Rectangle
        position={position(x, y)}
        width={w / 72}
        height={h / 72}
        cornerRadius={0.08}
        opacity={draw * 0.09}
        style={{
          fillColor: color,
          fillOpacity: 1,
          strokeColor: color,
          strokeWidth: 1,
        }}
      />
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={6}
        stroke={color}
        fill="none"
        strokeWidth={2.2}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
      <g opacity={progress(draw, 0.35, 1)}>
        {tex ? (
          <Tex x={x} y={y} tex={tex} color={color} size={32} />
        ) : (
          <Label x={x} y={y} size={32} color={color}>
            {label ?? ""}
          </Label>
        )}
        {sub && (
          <Label x={x} y={y + h / 2 + 39} color={C.muted} size={23}>
            {sub}
          </Label>
        )}
      </g>
    </>
  );
}
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = C.line,
  draw = 1,
  dashed = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  draw?: number;
  dashed?: boolean;
}) {
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g fill="none" stroke={color} strokeWidth={2.2}>
      <path
        d={`M${x1},${y1}L${mix(x1, x2, draw)},${mix(y1, y2, draw)}`}
        strokeDasharray={dashed ? "6 8" : undefined}
      />
      <path
        opacity={progress(draw, 0.75, 1)}
        d="M-12,-7L0,0L-12,7"
        transform={`translate(${x2},${y2}) rotate(${angle})`}
      />
    </g>
  );
}
export function Brace({
  x1,
  x2,
  y,
  label,
  color = C.orange,
  amount = 1,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
  color?: string;
  amount?: number;
}) {
  return (
    <g opacity={amount} fill="none" stroke={color} strokeWidth={2}>
      <path
        d={`M${x1},${y - 12}q0,12 14,12H${(x1 + x2) / 2 - 14}q14,0 14,14q0,-14 14,-14H${x2 - 14}q14,0 14,-12`}
      />
      <Label x={(x1 + x2) / 2} y={y + 48} color={color} size={25}>
        {label}
      </Label>
    </g>
  );
}
// Numerical packets use local SVG coordinates, so their text follows the packet exactly.
export function Packet({
  x,
  y,
  value,
  color = C.blue,
  opacity = 1,
}: {
  x: number;
  y: number;
  value: string;
  color?: string;
  opacity?: number;
}) {
  return (
    <g opacity={opacity} transform={`translate(${x},${y})`}>
      <rect
        x={-24}
        y={-24}
        width={48}
        height={48}
        rx={4}
        fill="#000"
        stroke={color}
        strokeWidth={2}
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={28}
        fontFamily="KaTeX_Main, Georgia, serif"
        fill={color}
      >
        {value}
      </text>
    </g>
  );
}
export function Matrix({
  x,
  y,
  values,
  cell = 65,
  color = C.blue,
  highlight = () => 0,
  visible = () => 1,
}: {
  x: number;
  y: number;
  values: (number | string)[][];
  cell?: number;
  color?: string;
  highlight?: (r: number, c: number) => number;
  visible?: (r: number, c: number) => number;
}) {
  const rows = values.length,
    cols = values[0].length;
  return (
    <g>
      <path
        d={`M${x - 11},${y - 5}h-11v${rows * cell + 5}h11 M${x + cols * cell + 6},${y - 5}h11v${rows * cell + 5}h-11`}
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      {values.flatMap((row, r) =>
        row.map((v, c) => {
          const a = highlight(r, c);
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x + c * cell + 2}
                y={y + r * cell + 2}
                width={cell - 4}
                height={cell - 4}
                fill={color}
                fillOpacity={a * 0.2}
                stroke={color}
                strokeOpacity={a * 0.85}
              />
              <text
                x={x + (c + 0.5) * cell}
                y={y + (r + 0.5) * cell}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="KaTeX_Main, Georgia, serif"
                fontSize={cell * 0.5}
                fill={a > 0.1 ? color : C.white}
                opacity={visible(r, c)}
              >
                {v}
              </text>
            </g>
          );
        }),
      )}
    </g>
  );
}
export function Caption({
  t,
  at,
  children,
  color = C.white,
}: {
  t: number;
  at: number;
  children: ReactNode;
  color?: string;
}) {
  return (
    <Fade t={t} at={at}>
      <Label x={720} y={655} color={color} size={31}>
        {children}
      </Label>
    </Fade>
  );
}
