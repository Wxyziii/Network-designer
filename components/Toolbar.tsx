"use client";

import {
  ChartBar,
  ChevronDown,
  CircleQuestionMark,
  Download,
  FileBraces,
  FilePlus,
  Grid3x3,
  Image as ImageIcon,
  LayoutTemplate,
  Menu,
  Moon,
  PanelLeft,
  PanelRight,
  Redo2,
  Spline,
  Sun,
  Tag,
  Undo2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getLink, LINKS } from "@/lib/catalog";
import { useDesigner, type EdgePathStyle } from "@/lib/store";

export const QUICK_LINKS = ["cat6", "cat6a", "poe", "fiber-sm", "fiber-mm", "wifi", "p2p", "wan", "vpn"];

function Dropdown({
  button,
  children,
  align = "left",
  className = "",
}: {
  button: (open: boolean) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", h);
    window.addEventListener("keydown", k);
    return () => {
      window.removeEventListener("mousedown", h);
      window.removeEventListener("keydown", k);
    };
  }, [open]);
  return (
    <div className={`relative ${className}`} ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{button(open)}</div>
      {open && (
        <div
          className={`absolute top-full z-40 mt-1.5 min-w-[220px] rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1.5 shadow-xl ${align === "right" ? "right-0" : "left-0"}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  onClick,
  icon,
  children,
  hint,
  active,
}: {
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-[var(--hover)] ${active ? "bg-[var(--hover)] font-medium" : ""}`}
    >
      {icon}
      <span className="flex-1">{children}</span>
      {hint && <span className="text-xs text-[var(--muted)]">{hint}</span>}
    </button>
  );
}

function LinkSwatch({ type, w = 28 }: { type: string; w?: number }) {
  const l = getLink(type);
  return (
    <svg width={w} height="10" className="shrink-0">
      <line x1="2" y1="5" x2={w - 2} y2="5" stroke={l.color} strokeWidth={l.width} strokeDasharray={l.dash} strokeLinecap="round" />
    </svg>
  );
}

export interface ToolbarActions {
  onTemplates: () => void;
  onNew: () => void;
  onImport: () => void;
  onExportJSON: () => void;
  onExportImage: (f: "png" | "svg") => void;
  onReport: () => void;
  onHelp: () => void;
  onTogglePalette: () => void;
  onToggleInspector: () => void;
}

export default function Toolbar(a: ToolbarActions) {
  const s = useDesigner();
  const linkDef = getLink(s.linkType);
  const groups = ["Copper", "Fiber", "Wireless", "Logical"] as const;
  const paths: [EdgePathStyle, string][] = [
    ["smoothstep", "Orthogonal"],
    ["bezier", "Curved"],
    ["straight", "Straight"],
  ];

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-1.5 border-b border-[var(--border)] bg-[var(--panel)] px-2 sm:gap-2 sm:px-3">
      <button className="nd-icon-btn lg:hidden" onClick={a.onTogglePalette} aria-label="Toggle device palette">
        <PanelLeft size={18} />
      </button>
      <div className="flex min-w-0 items-center gap-2">
        <img src="/favicon.svg" alt="" className="hidden h-7 w-7 sm:block" />
        <input
          value={s.projectName}
          onChange={(e) => s.setProjectName(e.target.value)}
          className="w-28 min-w-0 rounded-md bg-transparent px-1.5 py-1 text-sm font-semibold outline-none hover:bg-[var(--hover)] focus:bg-[var(--hover)] sm:w-48"
          aria-label="Project name"
        />
      </div>

      <div className="mx-1 hidden h-6 w-px bg-[var(--border)] sm:block" />

      {/* Connection type */}
      <Dropdown
        button={(open) => (
          <button className={`nd-btn ${open ? "bg-[var(--hover)]" : ""}`} title="Connection type for new links">
            <LinkSwatch type={s.linkType} />
            <span className="hidden max-w-[130px] truncate md:inline">{linkDef.label}</span>
            <ChevronDown size={14} />
          </button>
        )}
      >
        {(close) => (
          <div className="max-h-[70vh] w-64 overflow-y-auto">
            {groups.map((g) => (
              <div key={g} className="mb-1">
                <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">{g}</div>
                {LINKS.filter((l) => l.group === g).map((l) => {
                  const q = QUICK_LINKS.indexOf(l.type);
                  return (
                    <MenuItem
                      key={l.type}
                      active={l.type === s.linkType}
                      icon={<LinkSwatch type={l.type} />}
                      hint={q >= 0 ? String(q + 1) : undefined}
                      onClick={() => {
                        s.setLinkType(l.type);
                        close();
                      }}
                    >
                      {l.label}
                    </MenuItem>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </Dropdown>

      <Dropdown
        className="hidden sm:block"
        button={() => (
          <button className="nd-icon-btn" title="Line routing style">
            <Spline size={18} />
          </button>
        )}
      >
        {(close) =>
          paths.map(([p, label]) => (
            <MenuItem
              key={p}
              active={s.edgePath === p}
              onClick={() => {
                s.setEdgePath(p);
                close();
              }}
            >
              {label} lines
            </MenuItem>
          ))
        }
      </Dropdown>

      <button className="nd-icon-btn" onClick={s.undo} disabled={!s.past.length} title="Undo (Ctrl+Z)">
        <Undo2 size={18} />
      </button>
      <button className="nd-icon-btn" onClick={s.redo} disabled={!s.future.length} title="Redo (Ctrl+Shift+Z)">
        <Redo2 size={18} />
      </button>

      <div className="flex-1" />

      {/* Desktop actions */}
      <div className="hidden items-center gap-1.5 md:flex">
        <button className="nd-btn" onClick={a.onTemplates}>
          <LayoutTemplate size={16} /> Templates
        </button>
        <button className="nd-btn" onClick={a.onReport} title="Report, design checks & bill of materials">
          <ChartBar size={16} /> Report
        </button>
        <Dropdown
          align="right"
          button={() => (
            <button className="nd-btn nd-btn-primary">
              <Download size={16} /> Export <ChevronDown size={14} />
            </button>
          )}
        >
          {(close) => (
            <>
              <MenuItem icon={<ImageIcon size={16} />} onClick={() => (a.onExportImage("png"), close())}>
                PNG image
              </MenuItem>
              <MenuItem icon={<ImageIcon size={16} />} onClick={() => (a.onExportImage("svg"), close())}>
                SVG vector
              </MenuItem>
              <MenuItem icon={<FileBraces size={16} />} hint="Ctrl+S" onClick={() => (a.onExportJSON(), close())}>
                Project JSON
              </MenuItem>
            </>
          )}
        </Dropdown>
      </div>

      <Dropdown
        align="right"
        button={() => (
          <button className="nd-icon-btn" title="More">
            <Menu size={18} />
          </button>
        )}
      >
        {(close) => {
          const run = (f: () => void) => () => {
            f();
            close();
          };
          return (
            <>
              <MenuItem icon={<FilePlus size={16} />} onClick={run(a.onNew)}>
                New design
              </MenuItem>
              <MenuItem icon={<LayoutTemplate size={16} />} onClick={run(a.onTemplates)}>
                Templates…
              </MenuItem>
              <MenuItem icon={<Upload size={16} />} onClick={run(a.onImport)}>
                Import JSON…
              </MenuItem>
              <div className="md:hidden">
                <MenuItem icon={<ImageIcon size={16} />} onClick={run(() => a.onExportImage("png"))}>
                  Export PNG
                </MenuItem>
                <MenuItem icon={<ImageIcon size={16} />} onClick={run(() => a.onExportImage("svg"))}>
                  Export SVG
                </MenuItem>
                <MenuItem icon={<FileBraces size={16} />} onClick={run(a.onExportJSON)}>
                  Export JSON
                </MenuItem>
                <MenuItem icon={<ChartBar size={16} />} onClick={run(a.onReport)}>
                  Report & checks
                </MenuItem>
              </div>
              <div className="my-1 h-px bg-[var(--border)]" />
              <MenuItem icon={<Grid3x3 size={16} />} onClick={s.toggleSnap} hint={s.snap ? "On" : "Off"}>
                Snap to grid
              </MenuItem>
              <MenuItem icon={<Tag size={16} />} onClick={s.toggleLabels} hint={s.showLabels ? "On" : "Off"}>
                Show labels
              </MenuItem>
              <MenuItem icon={s.dark ? <Sun size={16} /> : <Moon size={16} />} onClick={s.toggleDark}>
                {s.dark ? "Light mode" : "Dark mode"}
              </MenuItem>
              <div className="sm:hidden">
                {paths.map(([p, label]) => (
                  <MenuItem key={p} active={s.edgePath === p} icon={<Spline size={16} />} onClick={() => s.setEdgePath(p)}>
                    {label} lines
                  </MenuItem>
                ))}
              </div>
              <div className="my-1 h-px bg-[var(--border)]" />
              <MenuItem icon={<CircleQuestionMark size={16} />} onClick={run(a.onHelp)}>
                Shortcuts & help
              </MenuItem>
            </>
          );
        }}
      </Dropdown>

      <button className="nd-icon-btn lg:hidden" onClick={a.onToggleInspector} aria-label="Toggle properties panel">
        <PanelRight size={18} />
      </button>
    </header>
  );
}
