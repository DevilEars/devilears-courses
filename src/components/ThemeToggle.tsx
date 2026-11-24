import { useEffect, useState } from "react";
import {
  applyTheme,
  readThemePref,
  resolveTheme,
  writeThemePref,
  type ResolvedTheme,
  type ThemePref,
} from "../lib/theme";

export default function ThemeToggle() {
  const [pref, setPref] = useState<ThemePref>(() =>
    typeof window === "undefined" ? "system" : readThemePref(),
  );
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    typeof window === "undefined" ? "light" : resolveTheme(readThemePref()),
  );

  useEffect(() => {
    setResolved(applyTheme(pref));
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readThemePref() === "system") {
        setResolved(applyTheme("system"));
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [pref]);

  function toggle() {
    const next: ThemePref = resolved === "dark" ? "light" : "dark";
    writeThemePref(next);
    setPref(next);
    setResolved(applyTheme(next));
  }

  const toDark = resolved === "light";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={toDark ? "Switch to dark mode" : "Switch to light mode"}
      aria-pressed={!toDark}
      title={toDark ? "Dark mode" : "Light mode"}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {toDark ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 3v1.6M12 19.4V21M4.6 4.6l1.1 1.1M18.3 18.3l1.1 1.1M3 12h1.6M19.4 12H21M4.6 19.4l1.1-1.1M18.3 5.7l1.1-1.1" />
          </svg>
        )}
      </span>
    </button>
  );
}
