"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type XYPosition,
} from "@xyflow/react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getDevice, getLink, ZONE_COLORS } from "./catalog";
import type { AppEdge, AppNode, DesignDoc, LinkData } from "./types";

export type EdgePathStyle = "smoothstep" | "bezier" | "straight";

interface Snapshot {
  nodes: AppNode[];
  edges: AppEdge[];
}

interface DesignerState {
  projectName: string;
  nodes: AppNode[];
  edges: AppEdge[];
  linkType: string;
  edgePath: EdgePathStyle;
  snap: boolean;
  dark: boolean;
  showLabels: boolean;
  past: Snapshot[];
  future: Snapshot[];
  clipboard: Snapshot | null;

  setProjectName: (name: string) => void;
  setLinkType: (t: string) => void;
  setEdgePath: (p: EdgePathStyle) => void;
  toggleSnap: () => void;
  toggleDark: () => void;
  toggleLabels: () => void;

  onNodesChange: (changes: NodeChange<AppNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<AppEdge>[]) => void;
  onConnect: (c: Connection) => void;

  snapshot: (coalesceKey?: string) => void;
  undo: () => void;
  redo: () => void;

  addDevice: (kind: string, position: XYPosition) => string;
  addZone: (position: XYPosition) => string;
  addNote: (position: XYPosition) => string;
  updateNodeData: (id: string, patch: Record<string, string | undefined>) => void;
  updateEdgeData: (id: string, patch: Partial<LinkData>) => void;
  deleteSelected: () => void;
  selectAll: () => void;
  selectOnly: (nodeId: string) => void;
  copySelected: () => void;
  paste: () => void;
  duplicateSelected: () => void;
  loadDoc: (doc: DesignDoc) => void;
  newDesign: () => void;
}

const HISTORY_LIMIT = 100;
let lastCoalesce: { key: string; at: number } | null = null;

export const uid = (prefix = "n") =>
  `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

function clean<T extends { selected?: boolean; dragging?: boolean }>(items: T[]): T[] {
  return items.map((i) => {
    const { selected: _s, dragging: _d, ...rest } = i as T & { selected?: boolean; dragging?: boolean };
    return rest as T;
  });
}

function nextLabel(nodes: AppNode[], base: string): string {
  const used = new Set(nodes.map((n) => (n.data as { label?: string }).label));
  for (let i = 1; i < 10000; i++) {
    const name = `${base} ${i}`;
    if (!used.has(name)) return name;
  }
  return base;
}

/** Zones must render below devices; keep them first in the array. */
function sortNodes(nodes: AppNode[]): AppNode[] {
  return [...nodes.filter((n) => n.type === "zone"), ...nodes.filter((n) => n.type !== "zone")];
}

export const useDesigner = create<DesignerState>()(
  persist(
    (set, get) => ({
      projectName: "Untitled network",
      nodes: [],
      edges: [],
      linkType: "cat6",
      edgePath: "smoothstep",
      snap: true,
      dark: false,
      showLabels: true,
      past: [],
      future: [],
      clipboard: null,

      setProjectName: (projectName) => set({ projectName }),
      setLinkType: (linkType) => set({ linkType }),
      setEdgePath: (edgePath) => set({ edgePath }),
      toggleSnap: () => set((s) => ({ snap: !s.snap })),
      toggleDark: () => set((s) => ({ dark: !s.dark })),
      toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),

      snapshot: (coalesceKey) => {
        const now = Date.now();
        if (coalesceKey && lastCoalesce && lastCoalesce.key === coalesceKey && now - lastCoalesce.at < 1200) {
          lastCoalesce.at = now;
          return;
        }
        lastCoalesce = coalesceKey ? { key: coalesceKey, at: now } : null;
        const { nodes, edges, past } = get();
        set({
          past: [...past.slice(-HISTORY_LIMIT + 1), { nodes: clean(nodes), edges: clean(edges) }],
          future: [],
        });
      },

      undo: () => {
        const { past, future, nodes, edges } = get();
        const prev = past[past.length - 1];
        if (!prev) return;
        lastCoalesce = null;
        set({
          nodes: prev.nodes,
          edges: prev.edges,
          past: past.slice(0, -1),
          future: [{ nodes: clean(nodes), edges: clean(edges) }, ...future],
        });
      },

      redo: () => {
        const { past, future, nodes, edges } = get();
        const next = future[0];
        if (!next) return;
        lastCoalesce = null;
        set({
          nodes: next.nodes,
          edges: next.edges,
          future: future.slice(1),
          past: [...past, { nodes: clean(nodes), edges: clean(edges) }],
        });
      },

      onNodesChange: (changes) => {
        if (changes.some((c) => c.type === "remove")) get().snapshot();
        // Removing a node removes its links too (React Flow does this for us via onEdgesChange).
        set({ nodes: applyNodeChanges(changes, get().nodes) });
      },

      onEdgesChange: (changes) => {
        if (changes.some((c) => c.type === "remove")) get().snapshot("edge-remove");
        set({ edges: applyEdgeChanges(changes, get().edges) });
      },

      onConnect: (c) => {
        if (c.source === c.target) return;
        get().snapshot();
        const link = getLink(get().linkType);
        const edge: AppEdge = {
          ...c,
          id: uid("e"),
          type: "link",
          data: { linkType: link.type, bandwidth: link.defaultBandwidth },
        };
        set({ edges: addEdge(edge, get().edges) as AppEdge[] });
      },

      addDevice: (kind, position) => {
        get().snapshot();
        const def = getDevice(kind);
        const id = uid("d");
        const node: AppNode = {
          id,
          type: "device",
          position,
          data: {
            kind,
            label: nextLabel(get().nodes, def.label),
            status: "up",
            ports: def.ports ? String(def.ports) : undefined,
          },
          selected: true,
        };
        set({
          nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), node],
          edges: get().edges.map((e) => ({ ...e, selected: false })),
        });
        return id;
      },

      addZone: (position) => {
        get().snapshot();
        const id = uid("z");
        const zones = get().nodes.filter((n) => n.type === "zone").length;
        const node: AppNode = {
          id,
          type: "zone",
          position,
          width: 360,
          height: 240,
          zIndex: -1,
          data: {
            kind: "zone",
            label: nextLabel(get().nodes, "VLAN"),
            subtitle: "10.0.0.0/24",
            color: ZONE_COLORS[zones % ZONE_COLORS.length],
          },
        };
        set({ nodes: sortNodes([...get().nodes.map((n) => ({ ...n, selected: false })), node]) });
        return id;
      },

      addNote: (position) => {
        get().snapshot();
        const id = uid("t");
        const node: AppNode = {
          id,
          type: "note",
          position,
          data: { kind: "note", text: "Double-click to edit this note" },
          selected: true,
        };
        set({ nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), node] });
        return id;
      },

      updateNodeData: (id, patch) => {
        get().snapshot(`node-${id}-${Object.keys(patch).join(",")}`);
        set({
          nodes: get().nodes.map((n) => (n.id === id ? ({ ...n, data: { ...(n.data as object), ...patch } } as AppNode) : n)),
        });
      },

      updateEdgeData: (id, patch) => {
        get().snapshot(`edge-${id}-${Object.keys(patch).join(",")}`);
        set({
          edges: get().edges.map((e) =>
            e.id === id ? { ...e, data: { ...(e.data as LinkData), ...patch } } : e,
          ),
        });
      },

      deleteSelected: () => {
        const { nodes, edges } = get();
        const nodeIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
        const hasEdges = edges.some((e) => e.selected);
        if (!nodeIds.size && !hasEdges) return;
        get().snapshot();
        set({
          nodes: nodes.filter((n) => !nodeIds.has(n.id)),
          edges: edges.filter((e) => !e.selected && !nodeIds.has(e.source) && !nodeIds.has(e.target)),
        });
      },

      selectAll: () =>
        set({
          nodes: get().nodes.map((n) => ({ ...n, selected: true })),
          edges: get().edges.map((e) => ({ ...e, selected: true })),
        }),

      selectOnly: (nodeId) =>
        set({
          nodes: get().nodes.map((n) => ({ ...n, selected: n.id === nodeId })),
          edges: get().edges.map((e) => ({ ...e, selected: false })),
        }),

      copySelected: () => {
        const { nodes, edges } = get();
        const sel = nodes.filter((n) => n.selected);
        if (!sel.length) return;
        const ids = new Set(sel.map((n) => n.id));
        set({
          clipboard: {
            nodes: clean(sel),
            edges: clean(edges.filter((e) => ids.has(e.source) && ids.has(e.target))),
          },
        });
      },

      paste: () => {
        const clip = get().clipboard;
        if (!clip || !clip.nodes.length) return;
        get().snapshot();
        const idMap = new Map<string, string>();
        const newNodes = clip.nodes.map((n) => {
          const id = uid(n.id.split("_")[0] || "n");
          idMap.set(n.id, id);
          return {
            ...n,
            id,
            selected: true,
            position: { x: n.position.x + 40, y: n.position.y + 40 },
          } as AppNode;
        });
        const newEdges = clip.edges.map((e) => ({
          ...e,
          id: uid("e"),
          source: idMap.get(e.source)!,
          target: idMap.get(e.target)!,
          selected: false,
        }));
        // Next paste offsets again.
        set({
          clipboard: { nodes: newNodes.map((n) => ({ ...n, selected: false })), edges: newEdges },
          nodes: sortNodes([...get().nodes.map((n) => ({ ...n, selected: false })), ...newNodes]),
          edges: [...get().edges.map((e) => ({ ...e, selected: false })), ...newEdges],
        });
      },

      duplicateSelected: () => {
        get().copySelected();
        get().paste();
      },

      loadDoc: (doc) => {
        get().snapshot();
        set({
          projectName: doc.name || "Imported network",
          nodes: sortNodes(doc.nodes ?? []),
          edges: (doc.edges ?? []).map((e) => ({ ...e, type: "link" })),
        });
      },

      newDesign: () => {
        get().snapshot();
        set({ projectName: "Untitled network", nodes: [], edges: [] });
      },
    }),
    {
      name: "network-designer:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        projectName: s.projectName,
        nodes: clean(s.nodes),
        edges: clean(s.edges),
        linkType: s.linkType,
        edgePath: s.edgePath,
        snap: s.snap,
        dark: s.dark,
        showLabels: s.showLabels,
      }),
    },
  ),
);

export function toDoc(): DesignDoc {
  const { projectName, nodes, edges } = useDesigner.getState();
  return { app: "network-designer", version: 1, name: projectName, nodes: clean(nodes), edges: clean(edges) };
}
