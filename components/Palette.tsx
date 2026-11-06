"use client";

import { ChevronDown, Search, StickyNote, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CATEGORIES, DEVICES, type DeviceDef } from "@/lib/catalog";
import { ZoneIcon } from "./icons";

export const DND_MIME = "application/x-network-designer";

export type PaletteItem = { type: "device"; kind: string } | { type: "zone" } | { type: "note" };

function onDragStart(e: React.DragEvent, item: PaletteItem) {
  e.dataTransfer.setData(DND_MIME, JSON.stringify(item));
  e.dataTransfer.effectAllowed = "move";
}

function Tile({
  label,
  color,
  icon,
  item,
  onAdd,
}: {
  label: string;
  color: string;
  icon: React.ReactNode;
  item: PaletteItem;
  onAdd: (i: PaletteItem) => void;
}) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onClick={() => onAdd(item)}
      title={`Drag onto the canvas or click to add: ${label}`}
      className="group flex flex-col items-center gap-1 rounded-lg border border-transparent p-1.5 text-center transition hover:border-[var(--border)] hover:bg-[var(--hover)] active:scale-95"
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-lg transition group-hover:scale-105"
        style={{ background: `${color}1a`, color }}
      >
        {icon}
      </span>
      <span className="line-clamp-2 text-[10.5px] leading-tight text-[var(--muted)] group-hover:text-[var(--fg)]">
        {label}
      </span>
    </button>
  );
}

export default function Palette({ onAdd, onClose }: { onAdd: (i: PaletteItem) => void; onClose?: () => void }) {
  const [q, setQ] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    const match = (d: DeviceDef) =>
      !term || `${d.label} ${d.kind} ${d.keywords ?? ""}`.toLowerCase().includes(term);
    return CATEGORIES.map((c) => ({ ...c, items: DEVICES.filter((d) => d.category === c.id && match(d)) })).filter(
      (g) => g.items.length,
    );
  }, [q]);

  return (
    <aside className="flex h-full w-full flex-col bg-[var(--panel)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] p-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${DEVICES.length} devices…`}
            className="nd-input pl-8"
          />
        </div>
        {onClose && (
          <button className="nd-icon-btn lg:hidden" onClick={onClose} aria-label="Close palette">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-6">
        {!q && (
          <section className="pt-3">
            <h3 className="nd-section-title px-1">Areas & Notes</h3>
            <div className="grid grid-cols-3 gap-1">
              <Tile
                label="Zone / VLAN"
                color="#3b82f6"
                icon={<ZoneIcon size={22} strokeWidth={1.75} />}
                item={{ type: "zone" }}
                onAdd={onAdd}
              />
              <Tile
                label="Text note"
                color="#ca8a04"
                icon={<StickyNote size={22} strokeWidth={1.75} />}
                item={{ type: "note" }}
                onAdd={onAdd}
              />
            </div>
          </section>
        )}
        {groups.map((g) => {
          const isCollapsed = collapsed[g.id] && !q;
          return (
            <section key={g.id} className="pt-3">
              <button
                className="nd-section-title flex w-full items-center justify-between px-1 hover:text-[var(--fg)]"
                onClick={() => setCollapsed((c) => ({ ...c, [g.id]: !c[g.id] }))}
              >
                <span>
                  {g.label} <span className="font-normal opacity-60">({g.items.length})</span>
                </span>
                <ChevronDown size={14} className={`transition ${isCollapsed ? "-rotate-90" : ""}`} />
              </button>
              {!isCollapsed && (
                <div className="grid grid-cols-3 gap-1">
                  {g.items.map((d) => {
                    const Icon = d.icon;
                    return (
                      <Tile
                        key={d.kind}
                        label={d.label}
                        color={d.color}
                        icon={<Icon size={22} strokeWidth={1.75} />}
                        item={{ type: "device", kind: d.kind }}
                        onAdd={onAdd}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
        {!groups.length && <p className="p-4 text-center text-sm text-[var(--muted)]">No devices match “{q}”.</p>}
      </div>
    </aside>
  );
}
