"use client";

import { ArrowLeftRight, Copy, MousePointerClick, Trash, X } from "lucide-react";
import { useMemo } from "react";
import { isValidIPv4 } from "@/lib/analysis";
import { DEVICES, getDevice, getLink, LINKS, ZONE_COLORS } from "@/lib/catalog";
import { useDesigner } from "@/lib/store";
import type { AppEdge, AppNode, DeviceData, LinkData, NoteData, ZoneData } from "@/lib/types";

function Field({
  label,
  value,
  onChange,
  placeholder,
  invalid,
  mono,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  invalid?: boolean;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="nd-label">{label}</span>
      <input
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`nd-input ${mono ? "font-mono text-[12.5px]" : ""} ${invalid ? "!border-red-500" : ""}`}
        spellCheck={false}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="nd-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="nd-input">
        {children}
      </select>
    </label>
  );
}

function Notes({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="nd-label">Notes</span>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="nd-input resize-y"
      />
    </label>
  );
}

function DeviceForm({ node }: { node: AppNode & { data: DeviceData } }) {
  const update = useDesigner((s) => s.updateNodeData);
  const d = node.data;
  const def = getDevice(d.kind);
  const set = (k: keyof DeviceData) => (v: string) => update(node.id, { [k]: v });
  const Icon = def.icon;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${def.color}1a`, color: def.color }}
        >
          <Icon size={24} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <Select label="Device type" value={d.kind} onChange={set("kind")}>
            {DEVICES.map((x) => (
              <option key={x.kind} value={x.kind}>
                {x.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <Field label="Name" value={d.label} onChange={set("label")} />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Hostname" value={d.hostname} onChange={set("hostname")} placeholder="sw-core-01" mono />
        <Select label="Status" value={d.status ?? "unknown"} onChange={set("status")}>
          <option value="up">Up</option>
          <option value="warning">Warning</option>
          <option value="down">Down</option>
          <option value="unknown">Unknown</option>
        </Select>
      </div>
      <h4 className="nd-section-title pt-1">Addressing</h4>
      <div className="grid grid-cols-2 gap-2">
        <Field
          label="IP address"
          value={d.ip}
          onChange={set("ip")}
          placeholder="192.168.1.10"
          invalid={!!d.ip && !isValidIPv4(d.ip) && !d.ip.includes(":")}
          mono
        />
        <Field label="Subnet mask" value={d.subnet} onChange={set("subnet")} placeholder="255.255.255.0" mono />
        <Field label="Gateway" value={d.gateway} onChange={set("gateway")} placeholder="192.168.1.1" mono />
        <Field label="VLAN" value={d.vlan} onChange={set("vlan")} placeholder="10" mono />
      </div>
      <Field label="MAC address" value={d.mac} onChange={set("mac")} placeholder="00:1A:2B:3C:4D:5E" mono />
      {def.wireless && (
        <>
          <h4 className="nd-section-title pt-1">Wireless</h4>
          <Field label="SSID" value={d.ssid} onChange={set("ssid")} />
          <div className="grid grid-cols-2 gap-2">
            <Select label="Band" value={d.band ?? ""} onChange={set("band")}>
              <option value="">—</option>
              {["2.4 GHz", "5 GHz", "6 GHz", "2.4 / 5 GHz", "Wi-Fi 6", "Wi-Fi 6E", "Wi-Fi 7", "60 GHz", "LTE", "5G"].map(
                (b) => (
                  <option key={b}>{b}</option>
                ),
              )}
            </Select>
            <Field label="Channel" value={d.channel} onChange={set("channel")} placeholder="36" />
          </div>
        </>
      )}
      <h4 className="nd-section-title pt-1">Hardware</h4>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Vendor" value={d.vendor} onChange={set("vendor")} placeholder="Cisco" />
        <Field label="Model" value={d.model} onChange={set("model")} placeholder="C9300-24P" />
      </div>
      <Field label="Port count" value={d.ports} onChange={set("ports")} placeholder="24" />
      <Notes value={d.notes} onChange={set("notes")} />
    </div>
  );
}

function ZoneForm({ node }: { node: AppNode & { data: ZoneData } }) {
  const update = useDesigner((s) => s.updateNodeData);
  return (
    <div className="space-y-3">
      <Field label="Zone name" value={node.data.label} onChange={(v) => update(node.id, { label: v })} />
      <Field
        label="Subnet / description"
        value={node.data.subtitle}
        onChange={(v) => update(node.id, { subtitle: v })}
        mono
      />
      <div>
        <span className="nd-label">Color</span>
        <div className="flex flex-wrap gap-2">
          {ZONE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => update(node.id, { color: c })}
              className="h-7 w-7 rounded-full border-2 transition hover:scale-110"
              style={{ background: c, borderColor: node.data.color === c ? "var(--fg)" : "transparent" }}
              aria-label={`Color ${c}`}
            />
          ))}
          <input
            type="color"
            value={node.data.color}
            onChange={(e) => update(node.id, { color: e.target.value })}
            className="h-7 w-9 cursor-pointer rounded border border-[var(--border)] bg-transparent"
          />
        </div>
      </div>
      <p className="text-xs text-[var(--muted)]">Drag the corner handles to resize the zone.</p>
    </div>
  );
}

function NoteForm({ node }: { node: AppNode & { data: NoteData } }) {
  const update = useDesigner((s) => s.updateNodeData);
  return (
    <label className="block">
      <span className="nd-label">Note text</span>
      <textarea
        value={node.data.text}
        onChange={(e) => update(node.id, { text: e.target.value })}
        rows={6}
        className="nd-input resize-y"
      />
    </label>
  );
}

function LinkForm({ edge, nodes }: { edge: AppEdge; nodes: AppNode[] }) {
  const update = useDesigner((s) => s.updateEdgeData);
  const d = (edge.data ?? { linkType: "cat6" }) as LinkData;
  const def = getLink(d.linkType);
  const name = (id: string) => {
    const n = nodes.find((x) => x.id === id);
    if (!n) return id;
    return n.type === "note" ? "Note" : (n.data as { label: string }).label;
  };
  const groups = ["Copper", "Fiber", "Wireless", "Logical"] as const;
  const set = (k: keyof LinkData) => (v: string) => update(edge.id, { [k]: v });
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] p-2 text-sm">
        <span className="truncate font-medium">{name(edge.source)}</span>
        <ArrowLeftRight size={14} className="shrink-0 text-[var(--muted)]" />
        <span className="truncate font-medium">{name(edge.target)}</span>
      </div>
      <Select
        label="Connection type"
        value={def.type}
        onChange={(v) => {
          const next = getLink(v);
          const keepBw = d.bandwidth && d.bandwidth !== def.defaultBandwidth;
          update(edge.id, { linkType: v, bandwidth: keepBw ? d.bandwidth : next.defaultBandwidth });
        }}
      >
        {groups.map((g) => (
          <optgroup key={g} label={g}>
            {LINKS.filter((l) => l.group === g).map((l) => (
              <option key={l.type} value={l.type}>
                {l.label}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
      <svg width="100%" height="14" className="block">
        <line
          x1="4"
          y1="7"
          x2="96%"
          y2="7"
          stroke={def.color}
          strokeWidth={def.width}
          strokeDasharray={def.dash}
          strokeLinecap="round"
        />
      </svg>
      <Field label="Label" value={d.label} onChange={set("label")} placeholder="Uplink" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Bandwidth" value={d.bandwidth} onChange={set("bandwidth")} placeholder="1 Gbps" />
        <Field label="Length" value={d.length} onChange={set("length")} placeholder="15 m" />
      </div>
      <Field label="VLANs (tagged)" value={d.vlans} onChange={set("vlans")} placeholder="10,20,30" mono />
      <Notes value={d.notes} onChange={set("notes")} />
    </div>
  );
}

export default function Inspector({ onClose }: { onClose?: () => void }) {
  const nodes = useDesigner((s) => s.nodes);
  const edges = useDesigner((s) => s.edges);
  const deleteSelected = useDesigner((s) => s.deleteSelected);
  const duplicate = useDesigner((s) => s.duplicateSelected);

  const selNodes = useMemo(() => nodes.filter((n) => n.selected), [nodes]);
  const selEdges = useMemo(() => edges.filter((e) => e.selected), [edges]);
  const total = selNodes.length + selEdges.length;

  let title = "Properties";
  let body: React.ReactNode;
  if (total === 0) {
    body = (
      <div className="flex flex-col items-center gap-3 px-4 py-10 text-center text-sm text-[var(--muted)]">
        <MousePointerClick size={28} />
        <p>Select a device, link or zone to edit its properties.</p>
        <ul className="space-y-1 text-left text-xs">
          <li>• Drag devices from the left panel</li>
          <li>• Drag from a device&apos;s edge dot to connect</li>
          <li>• Pick the cable type in the toolbar first</li>
          <li>• Shift + drag to box-select</li>
        </ul>
      </div>
    );
  } else if (total > 1) {
    title = `${total} items selected`;
    body = (
      <p className="text-sm text-[var(--muted)]">
        {selNodes.length} node(s) and {selEdges.length} link(s) selected. Drag to move them together, or use the
        buttons below.
      </p>
    );
  } else if (selNodes[0]) {
    const n = selNodes[0];
    if (n.type === "device") {
      title = getDevice(n.data.kind).label;
      body = <DeviceForm key={n.id} node={n} />;
    } else if (n.type === "zone") {
      title = "Zone";
      body = <ZoneForm key={n.id} node={n} />;
    } else {
      title = "Note";
      body = <NoteForm key={n.id} node={n as AppNode & { data: NoteData }} />;
    }
  } else {
    title = "Connection";
    body = <LinkForm key={selEdges[0].id} edge={selEdges[0]} nodes={nodes} />;
  }

  return (
    <aside className="flex h-full w-full flex-col bg-[var(--panel)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="truncate text-sm font-semibold">{title}</h2>
        {onClose && (
          <button className="nd-icon-btn lg:hidden" onClick={onClose} aria-label="Close properties">
            <X size={18} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">{body}</div>
      {total > 0 && (
        <div className="flex gap-2 border-t border-[var(--border)] p-3">
          {selNodes.length > 0 && (
            <button className="nd-btn flex-1" onClick={duplicate}>
              <Copy size={15} /> Duplicate
            </button>
          )}
          <button className="nd-btn nd-btn-danger flex-1" onClick={deleteSelected}>
            <Trash size={15} /> Delete
          </button>
        </div>
      )}
    </aside>
  );
}
