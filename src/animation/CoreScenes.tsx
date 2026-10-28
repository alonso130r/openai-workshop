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

export function IntroExample({ t }: { t: number }) {
  const combine = p(t, 14, 17),
    inputX = mix(140, 180, combine),
    outputX = mix(1100, 1050, combine);
  return (
    <>
      <Tex x={720} y={75} size={43} tex={String.raw`y_i=\max(x_i+3,0)`} />
      <Label x={inputX + 105} y={230} color={C.blue} size={28}>
        Input
      </Label>
      <Matrix
        x={inputX}
        y={280}
        values={[[-5, 1, 4]]}
        cell={70}
        highlight={() => 0.35}
      />
      <g opacity={1 - combine}>
        <Fade t={t} at={1}>
          <Arrow x1={370} y1={315} x2={600} y2={315} draw={p(t, 1, 2)} />
          <Tex x={485} y={250} tex="+3" color={C.orange} />
        </Fade>
        <Fade t={t} at={3}>
          <Label x={725} y={230} color={C.orange} size={28}>
            Intermediate
          </Label>
          <Matrix
            x={620}
            y={280}
            values={[[-2, 4, 7]]}
            cell={70}
            color={C.orange}
            highlight={() => 0.35}
            visible={(_, c) => p(t, 4 + c * 0.8, 4.7 + c * 0.8)}
          />
        </Fade>
        <Fade t={t} at={7}>
          <Arrow x1={850} y1={315} x2={1080} y2={315} draw={p(t, 7, 8)} />
          <Label x={965} y={250} color={C.white}>
            ReLU
          </Label>
        </Fade>
        {[-5, 1, 4].map((v, i) => {
          const q = p(t, 2.7 + i * 0.8, 4.3 + i * 0.8);
          return (
            <Packet
              key={i}
              x={mix(inputX + 35 + i * 70, 655 + i * 70, q)}
              y={315 - Math.sin(q * Math.PI) * 100}
              value={String(v)}
              opacity={
                p(t, 2.7 + i * 0.8, 3 + i * 0.8) *
                (1 - p(t, 4 + i * 0.8, 4.3 + i * 0.8))
              }
            />
          );
        })}
        {[-2, 4, 7].map((v, i) => {
          const q = p(t, 7.4 + i * 0.8, 9 + i * 0.8);
          return (
            <Packet
              key={i}
              x={mix(655 + i * 70, 1135 + i * 70, q)}
              y={315 - Math.sin(q * Math.PI) * 100}
              value={String(v)}
              color={C.orange}
              opacity={
                p(t, 7.4 + i * 0.8, 7.7 + i * 0.8) *
                (1 - p(t, 8.7 + i * 0.8, 9 + i * 0.8))
              }
            />
          );
        })}
        <Brace
          x1={610}
          x2={845}
          y={410}
          label="a separate temporary"
          amount={p(t, 10.5, 11.5)}
        />
      </g>
      <Fade t={t} at={8}>
        <Label x={outputX + 105} y={230} color={C.green} size={28}>
          Output
        </Label>
        <Matrix
          x={outputX}
          y={280}
          values={[[0, 4, 7]]}
          cell={70}
          color={C.green}
          highlight={(_, c) => (c === 0 ? p(t, 8.7, 9.4) * 0.7 : 0.35)}
          visible={(_, c) => p(t, 8.7 + c * 0.8, 9.4 + c * 0.8)}
        />
      </Fade>
      <g opacity={combine}>
        <Node
          x={720}
          y={315}
          w={440}
          h={105}
          tex={String.raw`\max(x_i+3,0)`}
          color={C.green}
          draw={combine}
        />
        <Arrow
          x1={425}
          y1={315}
          x2={485}
          y2={315}
          color={C.blue}
          draw={combine}
        />
        <Arrow
          x1={955}
          y1={315}
          x2={1030}
          y2={315}
          color={C.green}
          draw={combine}
        />
      </g>
      <Fade t={t} at={17.5}>
        <Tex
          x={720}
          y={465}
          size={32}
          color={C.orange}
          tex={String.raw`[-2,4,7]\quad\text{inside the program}`}
        />
      </Fade>
      <Fade t={t} at={7.5} until={13}>
        <Label x={720} y={560} size={29}>
          ReLU replaces negative values with zero.
        </Label>
      </Fade>
      <Caption t={t} at={21.5}>
        No separate temporary array.
      </Caption>
    </>
  );
}

export function ClassicCompiler({ t }: { t: number }) {
  const fold = p(t, 13, 16);
  return (
    <>
      <Node x={240} y={230} w={300} label="Program" draw={p(t, 0, 0.9)} />
      <Fade t={t} at={1}>
        <Tex x={240} y={365} size={38} tex={String.raw`y=x+(2+3)`} />
      </Fade>
      <Arrow x1={410} y1={230} x2={550} y2={230} draw={p(t, 2, 3.5)} />
      <Node
        x={720}
        y={230}
        w={300}
        label="Work list"
        color={C.orange}
        draw={p(t, 3, 4.2)}
      />
      <Fade t={t} at={4}>
        <Label x={480} y={150} size={24} color={C.muted}>
          list the work
        </Label>
      </Fade>
      <Arrow x1={890} y1={230} x2={1030} y2={230} draw={p(t, 6, 7.5)} />
      <Node
        x={1200}
        y={230}
        w={300}
        label="Instructions"
        color={C.green}
        draw={p(t, 7, 8.2)}
      />
      <Fade t={t} at={8}>
        <Label x={960} y={150} size={24} color={C.muted}>
          choose instructions
        </Label>
      </Fade>
      <Fade t={t} at={9}>
        <Label x={720} y={410} size={26} color={C.muted}>
          Simplify this expression
        </Label>
      </Fade>
      <g opacity={1 - fold} transform={`translate(${fold * 150},0)`}>
        <Fade t={t} at={10}>
          <Tex x={630} y={505} size={58} color={C.orange} tex="2+3" />
        </Fade>
      </g>
      <g opacity={fold} transform={`translate(${(1 - fold) * -150},0)`}>
        <Tex x={720} y={505} size={58} color={C.green} tex="5" />
      </g>
      <Fade t={t} at={16}>
        <Tex x={1200} y={365} size={38} color={C.green} tex="y=x+5" />
      </Fade>
      <Caption t={t} at={17.5}>
        Calculate fixed expressions before running.
      </Caption>
    </>
  );
}

export function Memory({ t }: { t: number }) {
  const values = ["1", "4", "7", "2", "5", "8", "3", "6", "9"];
  return (
    <>
      <Node x={250} y={315} w={300} h={330} label="" draw={p(t, 0, 1)} />
      <Label x={250} y={100} color={C.blue}>
        Device memory
      </Label>
      <Fade t={t} at={0.5}>
        {values.map((v, i) => (
          <Packet
            key={i}
            x={170 + (i % 3) * 80}
            y={230 + Math.floor(i / 3) * 80}
            value={v}
          />
        ))}
      </Fade>
      <Fade t={t} at={2}>
        <Label x={250} y={540} size={25} color={C.muted}>
          more space
        </Label>
      </Fade>
      <Node
        x={740}
        y={315}
        w={230}
        h={190}
        color={C.blueLight}
        label=""
        draw={p(t, 3, 4.3)}
      />
      <Fade t={t} at={4}>
        <Label x={740} y={170} color={C.blueLight}>
          Fast on-chip storage
        </Label>
        <Label x={740} y={540} size={25} color={C.muted}>
          limited space
        </Label>
      </Fade>
      <Node
        x={1190}
        y={315}
        w={250}
        h={190}
        color={C.green}
        label="Compute"
        draw={p(t, 4.5, 5.7)}
      />
      <Arrow
        x1={420}
        y1={315}
        x2={605}
        y2={315}
        color={C.blue}
        draw={p(t, 5, 6.5)}
      />
      <Arrow
        x1={875}
        y1={315}
        x2={1045}
        y2={315}
        color={C.green}
        draw={p(t, 6, 7.5)}
      />
      {[0, 1, 2].map((i) => {
        const q = p(t, 7 + i * 0.65, 9 + i * 0.65);
        return (
          <Packet
            key={i}
            x={mix(250, 680 + i * 60, q)}
            y={mix(315, 315, q) - Math.sin(q * Math.PI) * 95}
            value={values[i]}
            opacity={
              p(t, 7 + i * 0.65, 7.3 + i * 0.65) *
              (1 - p(t, 9 + i * 0.65, 9.3 + i * 0.65))
            }
          />
        );
      })}
      <Fade t={t} at={10}>
        {["1", "4", "7"].map((v, i) => (
          <Packet
            key={i}
            x={680 + i * 60}
            y={315}
            value={v}
            color={C.blueLight}
          />
        ))}
      </Fade>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const start = 12 + i * 0.55,
          q = p(t, start, start + 1.25);
        return (
          <Packet
            key={i}
            x={mix(680 + (i % 3) * 60, 1080, q)}
            y={315 - Math.sin(q * Math.PI) * 80}
            value={["1", "4", "7"][i % 3]}
            color={C.blueLight}
            opacity={
              p(t, start, start + 0.2) * (1 - p(t, start + 1.05, start + 1.25))
            }
          />
        );
      })}
      <Brace
        x1={620}
        x2={860}
        y={450}
        label="load once, reuse"
        color={C.blueLight}
        amount={p(t, 12, 13)}
      />
      <Fade t={t} at={16}>
        <Arrow
          x1={1190}
          y1={430}
          x2={1190}
          y2={565}
          color={C.green}
          draw={p(t, 16, 17.4)}
        />
        <Tex x={1190} y={605} tex="y" color={C.green} size={42} />
      </Fade>
      <Caption t={t} at={18.5}>
        Load a value once, then use it again.
      </Caption>
    </>
  );
}

export function Compiler({ t }: { t: number }) {
  const group = p(t, 11, 14),
    down = p(t, 14, 17);
  return (
    <>
      <Fade t={t} at={0}>
        <Label x={720} y={85} color={C.muted} size={27}>
          One possible execution plan
        </Label>
      </Fade>
      {["Multiply", "Add bias", "ReLU", "Result"].map((s, i) => (
        <Node
          key={s}
          x={210 + i * 340}
          y={245}
          w={235}
          label={s}
          color={i === 3 ? C.green : C.blue}
          draw={p(t, i * 0.8, i * 0.8 + 1)}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <Arrow
          key={i}
          x1={345 + i * 340}
          y1={245}
          x2={415 + i * 340}
          y2={245}
          draw={p(t, 1.1 + i * 0.8, 2 + i * 0.8)}
        />
      ))}
      <Fade t={t} at={5}>
        <Arrow
          x1={210}
          y1={310}
          x2={210}
          y2={440}
          color={C.blue}
          draw={p(t, 5, 6.5)}
        />
      </Fade>
      <Node
        x={290}
        y={515}
        w={450}
        h={90}
        label="Matrix multiply program"
        draw={p(t, 6.5, 8)}
      />
      <rect
        x={415}
        y={172}
        width={610}
        height={146}
        rx={12}
        fill={C.green}
        fillOpacity={group * 0.06}
        stroke={C.green}
        strokeWidth={2}
        strokeDasharray="12 6"
        pathLength={1}
        strokeDashoffset={1 - group}
        opacity={group}
      />
      <Fade t={t} at={12}>
        <Label x={720} y={380} color={C.green} size={27}>
          run these together
        </Label>
      </Fade>
      <Arrow x1={720} y1={405} x2={720} y2={455} color={C.green} draw={down} />
      <Node
        x={960}
        y={515}
        w={500}
        h={90}
        label="One program: add + ReLU"
        color={C.green}
        draw={down}
      />
      <Caption t={t} at={18.5}>
        These calculations can share one GPU program.
      </Caption>
    </>
  );
}
