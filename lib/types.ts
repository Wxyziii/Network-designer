import type { Edge, Node } from "@xyflow/react";

export type DeviceStatus = "up" | "down" | "warning" | "unknown";

export type DeviceData = {
  kind: string;
  label: string;
  hostname?: string;
  ip?: string;
  subnet?: string;
  gateway?: string;
  mac?: string;
  vlan?: string;
  vendor?: string;
  model?: string;
  ports?: string;
  status?: DeviceStatus;
  ssid?: string;
  band?: string;
  channel?: string;
  notes?: string;
};

export type ZoneData = {
  label: string;
  color: string;
  kind: "zone";
  subtitle?: string;
};

export type NoteData = {
  text: string;
  kind: "note";
};

export type LinkData = {
  linkType: string;
  label?: string;
  bandwidth?: string;
  vlans?: string;
  length?: string;
  notes?: string;
};

export type DeviceNode = Node<DeviceData, "device">;
export type ZoneNode = Node<ZoneData, "zone">;
export type NoteNode = Node<NoteData, "note">;
export type AppNode = DeviceNode | ZoneNode | NoteNode;
export type AppEdge = Edge<LinkData, "link">;

export interface DesignDoc {
  app: "network-designer";
  version: 1;
  name: string;
  nodes: AppNode[];
  edges: AppEdge[];
}
