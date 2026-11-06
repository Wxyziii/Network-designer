import { DEVICES, getDevice, getLink, LINKS } from "./catalog";
import type { AppEdge, AppNode, DeviceData } from "./types";

export interface Issue {
  level: "error" | "warning";
  message: string;
  nodeId?: string;
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}(\/([0-9]|[12]\d|3[0-2]))?$/;
const MAC = /^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i;

export function isValidIPv4(v: string) {
  return IPV4.test(v.trim());
}

export function analyze(nodes: AppNode[], edges: AppEdge[]): Issue[] {
  const issues: Issue[] = [];
  const devices = nodes.filter((n) => n.type === "device") as { id: string; data: DeviceData }[];
  const degree = new Map<string, number>();
  for (const e of edges) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  }

  const ips = new Map<string, string[]>();
  const names = new Map<string, string[]>();
  for (const d of devices) {
    const ip = d.data.ip?.trim();
    if (ip) {
      if (!isValidIPv4(ip) && !ip.includes(":")) {
        issues.push({ level: "error", message: `${d.data.label}: "${ip}" is not a valid IP address`, nodeId: d.id });
      } else {
        const key = ip.split("/")[0];
        ips.set(key, [...(ips.get(key) ?? []), d.id]);
      }
    }
    const mac = d.data.mac?.trim();
    if (mac && !MAC.test(mac)) {
      issues.push({ level: "warning", message: `${d.data.label}: MAC "${mac}" looks malformed`, nodeId: d.id });
    }
    const host = (d.data.hostname || d.data.label).trim().toLowerCase();
    names.set(host, [...(names.get(host) ?? []), d.id]);

    if (!degree.get(d.id)) {
      issues.push({ level: "warning", message: `${d.data.label} is not connected to anything`, nodeId: d.id });
    }
    const ports = parseInt(d.data.ports ?? "", 10);
    const wiredDeg = edges.filter(
      (e) => (e.source === d.id || e.target === d.id) && getLink(e.data?.linkType).group !== "Wireless",
    ).length;
    if (ports > 0 && wiredDeg > ports) {
      issues.push({
        level: "warning",
        message: `${d.data.label} has ${wiredDeg} cabled links but only ${ports} ports`,
        nodeId: d.id,
      });
    }
    if (d.data.status === "down") {
      issues.push({ level: "warning", message: `${d.data.label} is marked as down`, nodeId: d.id });
    }
  }
  for (const [ip, ids] of ips) {
    if (ids.length > 1) {
      issues.push({ level: "error", message: `IP conflict: ${ip} is used by ${ids.length} devices`, nodeId: ids[0] });
    }
  }
  for (const [name, ids] of names) {
    if (ids.length > 1) {
      issues.push({ level: "warning", message: `Duplicate name "${name}" on ${ids.length} devices`, nodeId: ids[0] });
    }
  }

  // Wireless links should involve at least one radio-capable device.
  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (const e of edges) {
    const def = getLink(e.data?.linkType);
    if (def.group !== "Wireless") continue;
    const a = byId.get(e.source);
    const b = byId.get(e.target);
    const radio = (n?: AppNode) => n?.type === "device" && !!getDevice((n.data as DeviceData).kind).wireless;
    if (a?.type === "device" && b?.type === "device" && !radio(a) && !radio(b)) {
      issues.push({
        level: "warning",
        message: `${def.label} link between ${(a.data as DeviceData).label} and ${(b.data as DeviceData).label}, neither has a radio`,
        nodeId: a.id,
      });
    }
  }
  return issues;
}

export interface BomRow {
  key: string;
  label: string;
  count: number;
  kind: "device" | "link";
}

export function billOfMaterials(nodes: AppNode[], edges: AppEdge[]): BomRow[] {
  const dev = new Map<string, number>();
  for (const n of nodes) {
    if (n.type !== "device") continue;
    const k = (n.data as DeviceData).kind;
    dev.set(k, (dev.get(k) ?? 0) + 1);
  }
  const lnk = new Map<string, number>();
  for (const e of edges) {
    const t = getLink(e.data?.linkType).type;
    lnk.set(t, (lnk.get(t) ?? 0) + 1);
  }
  return [
    ...DEVICES.filter((d) => dev.has(d.kind)).map((d) => ({
      key: d.kind,
      label: d.label,
      count: dev.get(d.kind)!,
      kind: "device" as const,
    })),
    ...LINKS.filter((l) => lnk.has(l.type)).map((l) => ({
      key: l.type,
      label: l.label,
      count: lnk.get(l.type)!,
      kind: "link" as const,
    })),
  ];
}
