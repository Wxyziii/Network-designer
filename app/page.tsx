"use client";

import dynamic from "next/dynamic";

const Designer = dynamic(() => import("@/components/Designer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh items-center justify-center text-sm text-[var(--muted)]">Loading designer…</div>
  ),
});

export default function Page() {
  return <Designer />;
}
