import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { allContent, backupContent, content, copy } from "./presentation";
import { StaticVisual } from "./StaticVisual";
import { Prose } from "./Math";
const ScenePlayer = lazy(() => import("./Scenes"));
const saved = () => {
  try {
    return JSON.parse(localStorage.getItem("extra-work-settings") || "{}");
  } catch {
    return {};
  }
};
type Settings = {
  presenter?: string;
  affiliation?: string;
  titles?: Record<number, string>;
};
export default function App() {
  const viewport = useRef<HTMLElement>(null);
  const [active, setActive] = useState(1);
  const [panel, setPanel] = useState<"contents" | "notes" | "backup" | null>(null);
  const [backupId, setBackupId] = useState(backupContent[0].id);
  const backup = backupContent.find((item) => item.id === backupId)!;
  const [settings] = useState<Settings>(saved);
  const notesOnly = new URLSearchParams(window.location.search).get("notes") === "1";
  // Switch to true to make the notes panel visible in the presentation again.
  const notesEnabled = false;
  const [fullscreen, setFullscreen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const notesButton = useRef<HTMLButtonElement>(null);
  const contentsButton = useRef<HTMLButtonElement>(null);
  const lastActive = useRef(1);
  const navigationTarget = useRef(1);
  const slide = content[active - 1];
  const presenterName = settings.presenter ?? copy[0].presenter ?? "";
  const title = (id: number) => settings.titles?.[allContent[id - 1].visualId] || copy[id - 1].title;
  const navigate = useCallback((id: number, instant = false) => {
    const target = Math.max(1, Math.min(content.length, id));
    navigationTarget.current = target;
    const el = document.getElementById(`slide-${target}`);
    el?.scrollIntoView({
      behavior:
        instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      block: "start",
    });
    setPanel(null);
  }, []);
  useEffect(() => {
    const initial = Number(location.hash.replace("#slide-", ""));
    if (initial >= 1 && initial <= content.length)
      requestAnimationFrame(() => navigate(initial, true));
    const hash = () => {
      const id = Number(location.hash.replace("#slide-", ""));
      if (id >= 1 && id <= content.length) navigate(id);
    };
    window.addEventListener("hashchange", hash);
    return () => window.removeEventListener("hashchange", hash);
  }, [navigate]);
  useEffect(() => {
    const root = viewport.current;
    if (!root) return;
    let frame = 0;
    let settle = 0;
    const scroll = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        navigationTarget.current = lastActive.current;
      }, 150);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let id = 1;
        for (const s of content) {
          const el = document.getElementById(`slide-${s.id}`)!;
          if (el.offsetTop <= root.scrollTop + root.clientHeight * 0.3)
            id = s.id;
          else break;
        }
        if (id !== lastActive.current) {
          lastActive.current = id;
          if (Math.abs(root.scrollTop - document.getElementById(`slide-${navigationTarget.current}`)!.offsetTop) < 2)
            navigationTarget.current = id;
          setActive(id);
          history.replaceState(null, "", `#slide-${id}`);
        }
      });
    };
    root.addEventListener("scroll", scroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, []);
  useEffect(() => {
    if (notesOnly) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel(null);
        (panel === "notes" ? notesButton : contentsButton).current?.focus();
        return;
      }
      if (panel) {
        if (e.key === "Tab") {
          const focusables = [
            ...panelRef.current!.querySelectorAll<HTMLElement>(
              "button,a,input,textarea,summary",
            ),
          ].filter((el) => el.getClientRects().length > 0);
          if (!focusables.length) return;
          const first = focusables[0],
            last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
        return;
      }
      if (
        (e.target as HTMLElement).closest(
          'input,textarea,select,[contenteditable="true"]',
        )
      )
        return;
      if (
        e.key === " " &&
        (e.target as HTMLElement).closest("button,a,summary")
      )
        return;
      if (e.key === " ") {
        e.preventDefault();
        const advance = new Event("presentation-advance", { cancelable: true });
        if (document.dispatchEvent(advance)) navigate(navigationTarget.current + 1);
        return;
      }
      if (e.key === "]" || e.key === "[") {
        e.preventDefault();
        document.dispatchEvent(
          new CustomEvent("presentation-step", {
            detail: e.key === "]" ? 1 : -1,
          }),
        );
        return;
      }
      if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        navigate(navigationTarget.current + 1);
      }
      if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        navigate(navigationTarget.current - 1);
      }
      if (e.key === "Home") {
        e.preventDefault();
        navigate(1);
      }
      if (e.key === "End") {
        e.preventDefault();
        navigate(content.length);
      }
      if (notesEnabled && e.key.toLowerCase() === "n") setPanel("notes");
      if (e.key.toLowerCase() === "c") setPanel("contents");
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [active, navigate, notesEnabled, notesOnly, panel]);
  useEffect(() => {
    if (panel) {
      panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    }
  }, [panel]);
  useEffect(() => {
    const change = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);
  const closePanel = () => {
    const previous = panel;
    setPanel(null);
    requestAnimationFrame(() =>
      (previous === "notes" ? notesButton : contentsButton).current?.focus(),
    );
  };
  if (notesOnly) {
    return (
      <main className="notes-page notes">
        <h1>Presenter notes</h1>
        {allContent.map((item, index) => (
          <section className="notes-page-slide" key={item.id}>
            <span className="notes-timing">{String(item.id).padStart(2, "0")} · {item.timing}</span>
            <h2>{title(item.id)}</h2>
            <h3>Explanation</h3>
            <p className="notes-copy"><Prose text={item.notes} /></p>
            {copy[index].speakerExtra && <><h3>Full example</h3><p><Prose text={copy[index].speakerExtra ?? ""} /></p></>}
            <h3>Audience takeaway</h3>
            <p><Prose text={item.takeaway} /></p>
            {item.transition && <><h3>Transition</h3><p>{item.transition}</p></>}
            {item.storyboard && <details><summary>Animation storyboard</summary><p className="storyboard"><Prose text={item.storyboard} /></p></details>}
            {item.links.length > 0 && <><h3>Sources</h3><ul className="source-list">{item.links.map((url) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{url.replace("https://", "")}</a></li>)}</ul></>}
          </section>
        ))}
      </main>
    );
  }
  return (
    <>
      <a className="skip-link" href="#presentation">
        Skip to presentation
      </a>
      <nav className="presenter-tools" aria-label="Presenter controls">
        <button
          ref={contentsButton}
          aria-expanded={panel === "contents"}
          aria-controls="presentation-panel"
          onClick={() => setPanel(panel === "contents" ? null : "contents")}
        >
          Contents <kbd>C</kbd>
        </button>
        {notesEnabled && <button
          ref={notesButton}
          aria-expanded={panel === "notes"}
          aria-controls="presentation-panel"
          onClick={() => setPanel(panel === "notes" ? null : "notes")}
        >
          Notes <kbd>N</kbd>
        </button>}
        <button
          className="fullscreen"
          aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={async () => {
            try {
              if (document.fullscreenElement) await document.exitFullscreen();
              else await document.documentElement.requestFullscreen();
            } catch {}
          }}
        >
          {fullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
      </nav>
      <main
        id="presentation"
        ref={viewport}
        className="slides"
        aria-label="Presentation slides"
        tabIndex={-1}
      >
        {content.map((s) => (
          <section
            className={`slide ${s.id === 1 ? "opening" : ""} ${s.scene ? "animated" : ""}`}
            id={`slide-${s.id}`}
            key={s.id}
            aria-labelledby={`title-${s.id}`}
            data-slide={s.id}
          >
            <div className="slide-inner">
              {s.id === 1 ? (
                <>
                  <h1 id="title-1">
                    {settings.titles?.[1] ? (
                      settings.titles[1]
                    ) : (
                      <>
                        Your AI is doing
                        <br />
                        <em>extra work.</em>
                      </>
                    )}
                  </h1>
                  <div className="title-divider" />
                  <p className="hero-subtitle">
                    A visual introduction to ML compilers
                  </p>
                  {presenterName && (
                    <p className="presenter">
                      A talk by {presenterName}
                      {settings.affiliation && ` · ${settings.affiliation}`}
                    </p>
                  )}
                  <p className="co-sponsor">
                    Co-sponsored by the OpenAI Student Collective at Waterloo
                  </p>
                  <p className="start-hint">Scroll or press Space to begin</p>
                </>
              ) : (
                <>
                  <h2 id={`title-${s.id}`}>{title(s.id)}</h2>
                  <div className="slide-visual">
                    {s.scene ? (
                      active === s.id ? (
                        <Suspense
                          fallback={<p className="loading">Preparing scene…</p>}
                        >
                          <ScenePlayer
                            name={s.scene}
                            active={active === s.id}
                          />
                        </Suspense>
                      ) : (
                        <div className="scene-poster">
                          <span>{s.scene}</span>
                          <p>{s.brief}</p>
                        </div>
                      )
                    ) : (
                      <StaticVisual id={s.visualId} />
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        ))}
      </main>
      <footer className="presentation-footer">
        <div className="slide-controls">
          <button
            aria-label="Previous slide"
            disabled={active === 1}
            onClick={() => navigate(active - 1)}
          >
            ←
          </button>
          <span aria-live="polite" aria-atomic="true">
            <b>{String(active).padStart(2, "0")}</b>
            <span> / {content.length}</span>
          </span>
          <button
            aria-label="Next slide"
            disabled={active === content.length}
            onClick={() => navigate(active + 1)}
          >
            →
          </button>
        </div>
      </footer>
      {panel && (
        <>
          <div className="panel-backdrop" onClick={closePanel} />
          <aside
            id="presentation-panel"
            className={`side-panel ${panel}`}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={
              panel === "contents" ? "Presentation contents" : panel === "backup" ? "Backup and take-home material" : "Presenter notes"
            }
          >
            <div className="panel-heading">
              <span className="eyebrow">
                {panel === "contents"
                  ? "CONTENTS"
                  : panel === "backup" ? "BACKUP AND TAKE-HOME MATERIAL"
                  : `PRESENTER NOTES · ${String(active).padStart(2, "0")}`}
              </span>
              <button aria-label="Close panel" onClick={closePanel}>
                ×
              </button>
            </div>
            {panel === "contents" ? (
              <>
                <ol className="contents-list">
                  {content.map((s) => (
                    <li key={s.id}>
                      <button
                        className={s.id === active ? "selected" : ""}
                        onClick={() => navigate(s.id)}
                      >
                        <span>{String(s.id).padStart(2, "0")}</span>
                        <span>{title(s.id)}</span>
                        {s.scene && <i title="Animated scene" />}
                      </button>
                    </li>
                  ))}
                </ol>
                <h3>Backup and take-home material</h3>
                <p className="short-note">Outside the 33-minute talk</p>
                <ol className="contents-list">
                  {backupContent.map((item) => (
                    <li key={item.id}>
                      <button onClick={() => { setBackupId(item.id); setPanel("backup"); }}>
                        <span>+</span><span>{item.title.replace(/^Backup: /, "")}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </>
            ) : panel === "backup" ? (
              <>
                <button className="backup-return" onClick={() => setPanel("contents")}>Back to Contents</button>
                <h2>{backup.title}</h2>
                <div className="slide-visual"><StaticVisual id={backup.visualId} /></div>
                {notesEnabled && <><h3>Explanation</h3><p className="notes-copy"><Prose text={backup.notes} /></p></>}
                {copy[backup.id - 1].speakerExtra && <p className="notes-copy"><Prose text={copy[backup.id - 1].speakerExtra ?? ""} /></p>}
                {backup.links.length > 0 && <><h3>Sources</h3><ul className="source-list">{backup.links.map((url) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{url.replace("https://", "")}</a></li>)}</ul></>}
              </>
            ) : (
              <>
                <h2>{title(active)}</h2>
                <span className="notes-timing">{slide.timing}</span>
                <h3>Explanation</h3>
                <p className="notes-copy">
                  <Prose text={slide.notes} />
                </p>
                {copy[active - 1].speakerExtra && (
                  <>
                    <h3>Full example</h3>
                    <p>
                      <Prose text={copy[active - 1].speakerExtra ?? ""} />
                    </p>
                  </>
                )}
                <h3>Audience takeaway</h3>
                <p>
                  <Prose text={slide.takeaway} />
                </p>
                {slide.transition && (
                  <>
                    <h3>Transition</h3>
                    <p>{slide.transition}</p>
                  </>
                )}
                {slide.storyboard && (
                  <details>
                    <summary>Animation storyboard</summary>
                    <p className="storyboard">
                      <Prose text={slide.storyboard} />
                    </p>
                  </details>
                )}
                {slide.links.length > 0 && (
                  <>
                    <h3>Sources</h3>
                    <ul className="source-list">
                      {slide.links.map((url) => (
                        <li key={url}>
                          <a href={url} target="_blank" rel="noreferrer">
                            {url.replace("https://", "")}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <p className="source-credit">
                  Operation scenes use{" "}
                  <a
                    href="https://github.com/ZSturman/Manim-React"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Manim React
                  </a>
                  . Diagrams are schematic.
                </p>
              </>
            )}
          </aside>
        </>
      )}
    </>
  );
}
