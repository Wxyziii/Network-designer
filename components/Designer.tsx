"use client";

import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
} from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDevice, getLink } from "@/lib/catalog";
import { exportImage, exportJSON, parseImport } from "@/lib/exporters";
import { useDesigner } from "@/lib/store";
import type { DesignDoc, DeviceData, ZoneData } from "@/lib/types";
import { edgeTypes } from "./LinkEdge";
import { HelpModal, ReportModal, TemplatesModal } from "./Modals";
import { nodeTypes } from "./nodes";
import Inspector from "./Inspector";
import Palette, { DND_MIME, type PaletteItem } from "./Palette";
import Toolbar, { QUICK_LINKS } from "./Toolbar";

type ModalKind = null | "templates" | "report" | "help";

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
}

function Canvas() {
  const s = useDesigner();
  const rf = useReactFlow();
  const wrapper = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [palOpen, setPalOpen] = useState(false);
  const [inspOpen, setInspOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // Only auto-fit when the canvas starts with content; otherwise React Flow would
  // zoom in on the very first device that gets dropped.
  const [startsWithContent] = useState(() => useDesigner.getState().nodes.length > 0);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  }, []);

  // Theme on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", s.dark);
  }, [s.dark]);

  // First visit: show a template picker on an empty canvas.
  useEffect(() => {
    if (!useDesigner.getState().nodes.length) setModal("templates");
  }, []);

  const addItem = useCallback(
    (item: PaletteItem, position?: { x: number; y: number }) => {
      const st = useDesigner.getState();
      let pos = position;
      if (!pos) {
        const rect = wrapper.current?.getBoundingClientRect();
        const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
        const p = rf.screenToFlowPosition({ x: cx, y: cy });
        const jitter = () => Math.round((Math.random() - 0.5) * 80);
        pos = { x: p.x - 40 + jitter(), y: p.y - 40 + jitter() };
      }
      if (st.snap) pos = { x: Math.round(pos.x / 20) * 20, y: Math.round(pos.y / 20) * 20 };
      if (item.type === "device") st.addDevice(item.kind, pos);
      else if (item.type === "zone") st.addZone(pos);
      else st.addNote(pos);
      setPalOpen(false);
    },
    [rf],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData(DND_MIME);
      if (!raw) {
        const file = e.dataTransfer.files?.[0];
        if (file) void importFile(file);
        return;
      }
      const item = JSON.parse(raw) as PaletteItem;
      const p = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const offset = item.type === "zone" ? { x: 20, y: 20 } : { x: 40, y: 32 };
      addItem(item, { x: p.x - offset.x, y: p.y - offset.y });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rf, addItem],
  );

  const loadDoc = useCallback(
    (doc: DesignDoc) => {
      useDesigner.getState().loadDoc(doc);
      setModal(null);
      requestAnimationFrame(() => rf.fitView({ padding: 0.15, duration: 400, maxZoom: 1.2 }));
    },
    [rf],
  );

  const importFile = useCallback(
    async (file: File) => {
      try {
        loadDoc(await parseImport(file));
        notify(`Imported “${file.name}”`);
      } catch (err) {
        notify(err instanceof Error ? err.message : "Import failed");
      }
    },
    [loadDoc, notify],
  );

  const doExportImage = useCallback(
    async (f: "png" | "svg") => {
      const nodes = rf.getNodes();
      if (!nodes.length) return notify("Nothing to export yet");
      // Deselect so selection outlines don't end up in the image.
      const st = useDesigner.getState();
      useDesigner.setState({
        nodes: st.nodes.map((n) => ({ ...n, selected: false })),
        edges: st.edges.map((e) => ({ ...e, selected: false })),
      });
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      try {
        await exportImage(f, nodes as Node[], st.projectName, st.dark);
        notify(`Exported ${f.toUpperCase()}`);
      } catch {
        notify("Image export failed");
      }
    },
    [rf, notify],
  );

  const focusNode = useCallback(
    (id: string) => {
      const n = rf.getNode(id);
      if (!n) return;
      useDesigner.getState().selectOnly(id);
      setModal(null);
      rf.fitView({ nodes: [{ id }], maxZoom: 1.4, duration: 500, padding: 0.6 });
    },
    [rf],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      const st = useDesigner.getState();
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (mod && k === "z" && !e.shiftKey) return e.preventDefault(), st.undo();
      if ((mod && k === "z" && e.shiftKey) || (mod && k === "y")) return e.preventDefault(), st.redo();
      if (mod && k === "c") return st.copySelected();
      if (mod && k === "v") return e.preventDefault(), st.paste();
      if (mod && k === "d") return e.preventDefault(), st.duplicateSelected();
      if (mod && k === "a") return e.preventDefault(), st.selectAll();
      if (mod && k === "s") return e.preventDefault(), exportJSON(), notify("Saved project JSON");
      if (k === "delete" || k === "backspace") return e.preventDefault(), st.deleteSelected();
      if (!mod && !e.altKey && /^[1-9]$/.test(e.key)) {
        const t = QUICK_LINKS[Number(e.key) - 1];
        if (t) {
          st.setLinkType(t);
          notify(`Connection type: ${getLink(t).label}`);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [notify]);

  const hasSelection = s.nodes.some((n) => n.selected) || s.edges.some((e) => e.selected);
  const prevSel = useRef(false);
  useEffect(() => {
    // On small screens, open the properties sheet when something becomes selected.
    if (hasSelection && !prevSel.current && window.innerWidth < 1024 && window.innerWidth >= 640) setInspOpen(true);
    prevSel.current = hasSelection;
  }, [hasSelection]);

  const link = getLink(s.linkType);

  return (
    <div className="flex h-dvh flex-col">
      <Toolbar
        onTemplates={() => setModal("templates")}
        onNew={() => {
          if (!s.nodes.length || confirm("Start a new, empty design? (You can undo this.)")) {
            s.newDesign();
            rf.setViewport({ x: 40, y: 40, zoom: 1 }, { duration: 300 });
          }
        }}
        onImport={() => fileInput.current?.click()}
        onExportJSON={() => {
          exportJSON();
          notify("Saved project JSON");
        }}
        onExportImage={doExportImage}
        onReport={() => setModal("report")}
        onHelp={() => setModal("help")}
        onTogglePalette={() => setPalOpen((o) => !o)}
        onToggleInspector={() => setInspOpen((o) => !o)}
      />
      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void importFile(f);
          e.target.value = "";
        }}
      />

      <div className="relative flex min-h-0 flex-1">
        {/* Palette */}
        <div
          className={`absolute inset-y-0 left-0 z-20 w-[280px] max-w-[85vw] border-r border-[var(--border)] shadow-xl transition-transform lg:static lg:translate-x-0 lg:shadow-none ${palOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Palette onAdd={(i) => addItem(i)} onClose={() => setPalOpen(false)} />
        </div>

        {/* Canvas */}
        <div
          ref={wrapper}
          className="relative min-w-0 flex-1"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={s.nodes}
            edges={s.edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={s.onNodesChange}
            onEdgesChange={s.onEdgesChange}
            onConnect={s.onConnect}
            onNodeDragStart={() => s.snapshot()}
            onSelectionDragStart={() => s.snapshot()}
            connectionMode={ConnectionMode.Loose}
            connectionLineStyle={{ stroke: link.color, strokeWidth: link.width, strokeDasharray: link.dash }}
            connectionRadius={28}
            snapToGrid={s.snap}
            snapGrid={[20, 20]}
            deleteKeyCode={null}
            selectionKeyCode="Shift"
            multiSelectionKeyCode={["Meta", "Control"]}
            elevateNodesOnSelect={false}
            elevateEdgesOnSelect
            colorMode={s.dark ? "dark" : "light"}
            fitView={startsWithContent}
            fitViewOptions={{ padding: 0.15, maxZoom: 1.2 }}
            defaultViewport={{ x: 40, y: 40, zoom: 1 }}
            minZoom={0.1}
            maxZoom={3}
            proOptions={{ hideAttribution: true }}
            onPaneClick={() => setPalOpen(false)}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.3} color={s.dark ? "#334155" : "#cbd5e1"} />
            <Controls position="bottom-left" showInteractive={false} />
            <MiniMap
              position="bottom-right"
              pannable
              zoomable
              className="!hidden sm:!block"
              nodeColor={(n) =>
                n.type === "device"
                  ? getDevice((n.data as DeviceData).kind).color
                  : n.type === "zone"
                    ? `${(n.data as ZoneData).color}40`
                    : "#fde68a"
              }
              nodeStrokeWidth={0}
              maskColor={s.dark ? "rgba(2,6,23,0.6)" : "rgba(241,245,249,0.6)"}
            />
          </ReactFlow>

          {!s.nodes.length && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
              <div className="max-w-sm text-center text-[var(--muted)]">
                <p className="text-lg font-medium text-[var(--fg)]">Your canvas is empty</p>
                <p className="mt-1 text-sm">
                  Drag devices from the left panel, or start from a template.
                </p>
                <button className="nd-btn nd-btn-primary pointer-events-auto mt-4" onClick={() => setModal("templates")}>
                  Browse templates
                </button>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute left-1/2 top-3 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)]/90 px-3 py-1 text-xs text-[var(--muted)] shadow-sm backdrop-blur sm:flex">
            <svg width="22" height="8">
              <line x1="1" y1="4" x2="21" y2="4" stroke={link.color} strokeWidth={link.width} strokeDasharray={link.dash} />
            </svg>
            New links: <span className="font-medium text-[var(--fg)]">{link.label}</span>
            <span className="opacity-60">· keys 1–9 to switch</span>
          </div>

          {toast && (
            <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-white dark:text-slate-900">
              {toast}
            </div>
          )}
        </div>

        {/* Inspector */}
        <div
          className={`absolute inset-y-0 right-0 z-20 w-[300px] max-w-[90vw] border-l border-[var(--border)] shadow-xl transition-transform lg:static lg:translate-x-0 lg:shadow-none ${inspOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <Inspector onClose={() => setInspOpen(false)} />
        </div>
      </div>

      {modal === "templates" && <TemplatesModal onClose={() => setModal(null)} onPick={loadDoc} />}
      {modal === "report" && <ReportModal onClose={() => setModal(null)} onFocus={focusNode} />}
      {modal === "help" && <HelpModal onClose={() => setModal(null)} />}
    </div>
  );
}

export default function Designer() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
}
