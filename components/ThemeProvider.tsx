"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    const saved = localStorage.getItem("my-recipe-theme") as
      | "light"
      | "dark"
      | null;
    const initial = saved ?? "light";
    document.documentElement.setAttribute("data-theme", initial);
    setTheme(initial);
  }, [setTheme]);

  return <>{children}</>;
}
