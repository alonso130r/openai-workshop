import { useCallback, useEffect, useRef, useState } from "react";
import { ManimScene } from "manim-react";
import {
  IntroExample,
  ClassicCompiler,
  Memory,
  Compiler,
} from "./animation/CoreScenes";
import {
  Fusion,
  DotProduct,
  Tiling,
  Replay,
  Guards,
} from "./animation/OptimizationScenes";
import { scenes as plans, nextBeat } from "./animation/timeline.mjs";
import { W, H } from "./animation/Primitives";

const renderers = {
  IntroExample,
  ClassicCompiler,
  Memory,
  Compiler,
  Fusion,
  DotProduct,
  Tiling,
  Replay,
  Guards,
};
const positions = new Map<string, number>();
function PlayIcon({ playing, replay }: { playing: boolean; replay: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      {playing ? (
        <g fill="currentColor">
          <rect x="6" y="5" width="4" height="14" />
          <rect x="14" y="5" width="4" height="14" />
        </g>
      ) : replay ? (
        <path
          d="M5 8a8 8 0 1 1-1 7M5 2v6h6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      ) : (
        <path d="M8 4l12 8-12 8z" fill="currentColor" />
      )}
    </svg>
  );
}
function motionPreference() {
  try {
    return (
      sessionStorage.getItem("extra-work-motion") === "on" ||
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
}

export default function ScenePlayer({
  name,
  active,
}: {
  name: string;
  active: boolean;
}) {
  const plan = plans[name];
  const Renderer = renderers[name as keyof typeof renderers];
  const [time, setTime] = useState(() => positions.get(name) ?? 0),
    [playing, setPlaying] = useState(false),
    [motion, setMotion] = useState(motionPreference),
    [speed, setSpeed] = useState(1);
  const clock = useRef(time);
  clock.current = time;
  const toggle = useCallback(() => {
    if (!motion) {
      setMotion(true);
      try {
        sessionStorage.setItem("extra-work-motion", "on");
      } catch {}
    }
    if (clock.current >= plan.duration) {
      clock.current = 0;
      setTime(0);
    }
    setPlaying((value) => !value);
  }, [motion, plan.duration]);
  const step = useCallback(
    (direction: number) => {
      setPlaying(false);
      setTime(nextBeat(plan, clock.current, direction));
    },
    [plan],
  );
  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);
  useEffect(
    () => () => {
      positions.set(name, clock.current);
    },
    [name],
  );
  useEffect(() => {
    const onToggle = () => toggle(),
      onStep = (e: Event) => step((e as CustomEvent<number>).detail),
      onVisibility = () => {
        if (document.hidden) setPlaying(false);
      };
    document.addEventListener("presentation-toggle", onToggle);
    document.addEventListener("presentation-step", onStep);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("presentation-toggle", onToggle);
      document.removeEventListener("presentation-step", onStep);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [toggle, step]);
  useEffect(() => {
    if (!playing) return;
    let frame = 0,
      last = performance.now(),
      position = clock.current;
    const tick = (now: number) => {
      position = Math.min(
        plan.duration,
        position + Math.min(0.1, (now - last) / 1000) * speed,
      );
      last = now;
      clock.current = position;
      setTime(position);
      if (position === plan.duration) setPlaying(false);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, plan.duration]);
  const beat = plan.beats.findLast((b) => b.at <= time + 0.02) ?? plan.beats[0];
  return (
    <div
      className="scene-player"
      data-scene={name}
      data-time={time.toFixed(2)}
      data-beat={beat.label}
    >
      <div
        className="scene-canvas"
        role="img"
        aria-label={`${name}: ${beat.label}. Schematic animation.`}
      >
        <ManimScene
          width={W}
          height={H}
          frameWidth={20}
          frameHeight={10}
          showControls={false}
          autoPlay={false}
          backgroundColor="#000000"
          style={{ width: "100%", height: "100%" }}
        >
          <Renderer t={time} />
        </ManimScene>
      </div>
      <div className="scene-controls" aria-label="Animation controls">
        <div className="transport">
          <button
            aria-label="Previous animation step"
            title="Previous step ["
            disabled={time === 0}
            onClick={() => step(-1)}
          >
            ‹
          </button>
          <button
            className="play-button"
            aria-label={
              !motion
                ? "Enable animation"
                : playing
                  ? "Pause animation"
                  : time >= plan.duration
                    ? "Replay animation"
                    : "Play animation"
            }
            title="Play / pause: Space"
            onClick={toggle}
          >
            <PlayIcon playing={playing} replay={time >= plan.duration} />
            <span>
              {!motion
                ? "Enable motion"
                : playing
                  ? "Pause"
                  : time >= plan.duration
                    ? "Replay"
                    : "Play"}
            </span>
          </button>
          <button
            aria-label="Next animation step"
            title="Next step ]"
            disabled={time === plan.duration}
            onClick={() => step(1)}
          >
            ›
          </button>
          <button
            className="reset-animation"
            aria-label="Reset animation"
            onClick={() => {
              setPlaying(false);
              setTime(0);
            }}
          >
            ↺
          </button>
        </div>
        <div className="scene-timeline">
          <input
            aria-label="Animation progress"
            aria-valuetext={`${beat.label}, ${Math.round(time)} seconds`}
            type="range"
            min={0}
            max={plan.duration}
            step={0.01}
            value={time}
            onChange={(e) => {
              setPlaying(false);
              setTime(Number(e.target.value));
            }}
          />
          <div className="timeline-marks" aria-hidden="true">
            {plan.beats.map((b) => (
              <i
                key={b.at}
                style={{ left: `${(b.at / plan.duration) * 100}%` }}
              />
            ))}
          </div>
        </div>
        <span className="scene-time">
          {Math.floor(time).toString().padStart(2, "0")} / {plan.duration}s
        </span>
        <select
          aria-label="Playback speed"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        >
          <option value={0.75}>0.75×</option>
          <option value={1}>1×</option>
          <option value={1.25}>1.25×</option>
          <option value={1.5}>1.5×</option>
        </select>
      </div>
    </div>
  );
}
