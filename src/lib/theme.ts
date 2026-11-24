export const THEME_KEY = "devilears-courses-theme";

export type ThemePref = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export function readThemePref(): ThemePref {
  try {
    const value = localStorage.getItem(THEME_KEY);
    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
  } catch {
    // Ignore unavailable storage (private mode, tests).
  }
  return "system";
}

export function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(pref: ThemePref): ResolvedTheme {
  return pref === "system" ? systemTheme() : pref;
}

export function applyTheme(pref: ThemePref): ResolvedTheme {
  const resolved = resolveTheme(pref);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "dark" ? "#13110f" : "#f4efe6");
  }
  return resolved;
}

export function writeThemePref(pref: ThemePref): void {
  try {
    if (pref === "system") {
      localStorage.removeItem(THEME_KEY);
    } else {
      localStorage.setItem(THEME_KEY, pref);
    }
  } catch {
    // Ignore unavailable storage.
  }
}
