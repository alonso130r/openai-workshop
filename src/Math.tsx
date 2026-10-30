import katex from "katex";
export function MathText({
  tex,
  display = false,
}: {
  tex: string;
  display?: boolean;
}) {
  return (
    <span
      className={display ? "math display" : "math"}
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(tex, {
          displayMode: display,
          throwOnError: false,
          output: "htmlAndMathml",
        }),
      }}
    />
  );
}
export function Prose({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\\\([\s\S]*?\\\))/g)
        .map((part, i) =>
          part.startsWith("\\(") ? (
            <MathText key={i} tex={part.slice(2, -2)} />
          ) : (
            <span key={i}>{part.replaceAll("`", "")}</span>
          ),
        )}
    </>
  );
}

export function SpeakerScript({ text }: { text: string }) {
  return (
    <ul className="speaker-script">
      {text.split("\n").filter(Boolean).map((line, index) => {
        const bullet = line.replace(/^- /, "");
        const cue = bullet.startsWith("[") && bullet.endsWith("]");
        return (
          <li key={index} className={cue ? "script-cue" : undefined}>
            <Prose text={bullet} />
          </li>
        );
      })}
    </ul>
  );
}
