"use client";

import { getNodesBounds, getViewportForBounds, type Node } from "@xyflow/react";
import { toPng, toSvg } from "html-to-image";
import { billOfMaterials } from "./analysis";
import { toDoc } from "./store";
import type { AppEdge, AppNode, DesignDoc } from "./types";

function slug(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "network";
}

export function download(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function downloadText(text: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  download(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportJSON() {
  const doc = toDoc();
  downloadText(JSON.stringify(doc, null, 2), `${slug(doc.name)}.network.json`, "application/json");
}

export function exportCSV(nodes: AppNode[], edges: AppEdge[], name: string) {
  const rows = [["Section", "Item", "Quantity"]];
  for (const r of billOfMaterials(nodes, edges)) rows.push([r.kind === "device" ? "Device" : "Link", r.label, String(r.count)]);
  rows.push([]);
  rows.push(["Device", "Type", "Hostname", "IP", "Subnet", "Gateway", "VLAN", "MAC", "Vendor", "Model", "Status"]);
  for (const n of nodes) {
    if (n.type !== "device") continue;
    const d = n.data;
    rows.push([
      d.label,
      d.kind,
      d.hostname ?? "",
      d.ip ?? "",
      d.subnet ?? "",
      d.gateway ?? "",
      d.vlan ?? "",
      d.mac ?? "",
      d.vendor ?? "",
      d.model ?? "",
      d.status ?? "",
    ]);
  }
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  downloadText(rows.map((r) => r.map(esc).join(",")).join("\n"), `${slug(name)}-inventory.csv`, "text/csv");
}

export async function parseImport(file: File): Promise<DesignDoc> {
  const text = await file.text();
  const doc = JSON.parse(text) as DesignDoc;
  if (!doc || !Array.isArray(doc.nodes) || !Array.isArray(doc.edges)) {
    throw new Error("This file is not a Network Designer export.");
  }
  return doc;
}

export async function exportImage(format: "png" | "svg", nodes: Node[], name: string, dark: boolean) {
  const viewportEl = document.querySelector<HTMLElement>(".react-flow__viewport");
  if (!viewportEl || !nodes.length) return;
  const bounds = getNodesBounds(nodes);
  const pad = 60;
  const width = Math.min(Math.max(bounds.width + pad * 2, 400), 6000);
  const height = Math.min(Math.max(bounds.height + pad * 2, 300), 6000);
  const vp = getViewportForBounds(bounds, width, height, 0.1, 2, 0.08);
  const opts = {
    backgroundColor: dark ? "#0b1120" : "#ffffff",
    width,
    height,
    pixelRatio: 2,
    filter: (el: HTMLElement) => !el.classList?.contains("react-flow__resize-control"),
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`,
    },
  };
  const url = format === "png" ? await toPng(viewportEl, opts) : await toSvg(viewportEl, opts);
  download(url, `${slug(name)}.${format}`);
}
