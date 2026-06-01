"use client";

import { useEffect } from "react";
import { useDataStore } from "@/store/dataStore";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const loaded = useDataStore((s) => s.loaded);
  const fetchAll = useDataStore((s) => s.fetchAll);

  useEffect(() => {
    if (!loaded) fetchAll();
  }, [loaded, fetchAll]);

  if (!loaded) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "#fff" }}
      >
        <p
          className="text-sm tracking-[0.2em] uppercase"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-serif), serif" }}
        >
          Loading...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
