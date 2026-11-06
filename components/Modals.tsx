"use client";

import { CircleCheck, TriangleExclamationPoint, X, CircleX, FileSpreadsheet } from "lucide-react";
import { useEffect, useMemo } from "react";
import { analyze, billOfMaterials } from "@/lib/analysis";
import { getDevice, getLink } from "@/lib/catalog";
import { exportCSV } from "@/lib/exporters";
import { useDesigner } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";
import type { DesignDoc } from "@/lib/types";

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-label={title}
        className={`flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-2xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl sm:rounded-2xl ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
          <h2 className="font-semibold">{title}</h2>
          <button className="nd-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function TemplatesModal({ onClose, onPick }: { onClose: () => void; onPick: (d: DesignDoc) => void }) {
  return (
    <Modal title="Start from a template" onClose={onClose} wide>
      <div className="grid gap-3 sm:grid-cols-2">
        {TEMPLATES.map((t) => {
          const doc = t.build();
          const kinds = [...new Set(doc.nodes.filter((n) => n.type === "device").map((n) => (n.data as { kind: string }).kind))];
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.build())}
              className="rounded-xl border border-[var(--border)] p-4 text-left transition hover:border-[var(--accent)] hover:bg-[var(--hover)]"
            >
              <div className="font-medium">{t.name}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">{t.description}</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {kinds.slice(0, 10).map((k) => {
                  const d = getDevice(k);
                  const I = d.icon;
                  return (
                    <span
                      key={k}
                      title={d.label}
                      className="flex h-7 w-7 items-center justify-center rounded-md"
                      style={{ background: `${d.color}1a`, color: d.color }}
                    >
                      <I size={16} strokeWidth={1.75} />
                    </span>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-[var(--muted)]">
                {doc.nodes.filter((n) => n.type === "device").length} devices · {doc.edges.length} links
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-[var(--muted)]">Loading a template replaces the current canvas. You can undo it.</p>
    </Modal>
  );
}

export function ReportModal({ onClose, onFocus }: { onClose: () => void; onFocus: (id: string) => void }) {
  const nodes = useDesigner((s) => s.nodes);
  const edges = useDesigner((s) => s.edges);
  const name = useDesigner((s) => s.projectName);
  const issues = useMemo(() => analyze(nodes, edges), [nodes, edges]);
  const bom = useMemo(() => billOfMaterials(nodes, edges), [nodes, edges]);
  const devices = bom.filter((r) => r.kind === "device");
  const links = bom.filter((r) => r.kind === "link");

  return (
    <Modal title="Network report" onClose={onClose} wide>
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Devices", nodes.filter((n) => n.type === "device").length],
          ["Links", edges.length],
          ["Zones", nodes.filter((n) => n.type === "zone").length],
          ["Issues", issues.length],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-[var(--border)] p-3">
            <div className="text-xs text-[var(--muted)]">{k}</div>
            <div className="text-2xl font-semibold tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      <h3 className="nd-section-title mt-6">Design checks</h3>
      {issues.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          <CircleCheck size={16} /> No problems found.
        </div>
      ) : (
        <ul className="space-y-1">
          {issues.map((i, idx) => (
            <li key={idx}>
              <button
                className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-[var(--hover)]"
                onClick={() => i.nodeId && onFocus(i.nodeId)}
              >
                {i.level === "error" ? (
                  <CircleX size={16} className="mt-0.5 shrink-0 text-red-500" />
                ) : (
                  <TriangleExclamationPoint size={16} className="mt-0.5 shrink-0 text-amber-500" />
                )}
                {i.message}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="nd-section-title">Bill of materials: devices</h3>
          <table className="w-full text-sm">
            <tbody>
              {devices.map((r) => {
                const d = getDevice(r.key);
                const I = d.icon;
                return (
                  <tr key={r.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-1.5">
                      <span className="flex items-center gap-2">
                        <I size={16} style={{ color: d.color }} strokeWidth={1.75} /> {r.label}
                      </span>
                    </td>
                    <td className="py-1.5 text-right tabular-nums">{r.count}</td>
                  </tr>
                );
              })}
              {!devices.length && (
                <tr>
                  <td className="py-2 text-[var(--muted)]">No devices yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="nd-section-title">Bill of materials: links</h3>
          <table className="w-full text-sm">
            <tbody>
              {links.map((r) => {
                const l = getLink(r.key);
                return (
                  <tr key={r.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-1.5">
                      <span className="flex items-center gap-2">
                        <svg width="22" height="8">
                          <line x1="1" y1="4" x2="21" y2="4" stroke={l.color} strokeWidth={l.width} strokeDasharray={l.dash} />
                        </svg>
                        {r.label}
                      </span>
                    </td>
                    <td className="py-1.5 text-right tabular-nums">{r.count}</td>
                  </tr>
                );
              })}
              {!links.length && (
                <tr>
                  <td className="py-2 text-[var(--muted)]">No links yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <button className="nd-btn mt-6" onClick={() => exportCSV(nodes, edges, name)}>
        <FileSpreadsheet size={15} /> Download inventory CSV
      </button>
    </Modal>
  );
}

const SHORTCUTS: [string, string][] = [
  ["Ctrl/⌘ + Z", "Undo"],
  ["Ctrl/⌘ + Shift + Z  or  Ctrl + Y", "Redo"],
  ["Ctrl/⌘ + C / V", "Copy / paste"],
  ["Ctrl/⌘ + D", "Duplicate selection"],
  ["Ctrl/⌘ + A", "Select all"],
  ["Delete / Backspace", "Delete selection"],
  ["Ctrl/⌘ + S", "Save design as JSON"],
  ["Shift + drag", "Box select"],
  ["Ctrl/⌘ + click", "Add to selection"],
  ["Scroll / pinch", "Zoom"],
  ["Drag on empty canvas", "Pan"],
  ["1 – 9", "Quick-pick connection type"],
  ["Double-click a note", "Edit text"],
];

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Keyboard shortcuts & tips" onClose={onClose}>
      <table className="w-full text-sm">
        <tbody>
          {SHORTCUTS.map(([k, v]) => (
            <tr key={k} className="border-b border-[var(--border)] last:border-0">
              <td className="py-2 pr-4">
                <kbd className="rounded border border-[var(--border)] bg-[var(--hover)] px-1.5 py-0.5 font-mono text-xs">{k}</kbd>
              </td>
              <td className="py-2 text-[var(--muted)]">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-[var(--muted)]">
        Your design is saved automatically in this browser. Use Export → JSON to back it up or share it.
      </p>
    </Modal>
  );
}
