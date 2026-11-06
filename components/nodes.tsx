"use client";

import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import { memo, useEffect, useRef, useState } from "react";
import { getDevice } from "@/lib/catalog";
import { useDesigner } from "@/lib/store";
import type { DeviceNode as DeviceNodeT, NoteNode as NoteNodeT, ZoneNode as ZoneNodeT } from "@/lib/types";

const STATUS_COLOR: Record<string, string> = {
  up: "#22c55e",
  down: "#ef4444",
  warning: "#f59e0b",
  unknown: "#94a3b8",
};

const SIDES: [string, Position][] = [
  ["t", Position.Top],
  ["r", Position.Right],
  ["b", Position.Bottom],
  ["l", Position.Left],
];

function Handles() {
  return (
    <>
      {SIDES.map(([id, pos]) => (
        <Handle key={id} id={id} type="source" position={pos} className="nd-handle" />
      ))}
    </>
  );
}

export const DeviceNode = memo(function DeviceNode({ data, selected }: NodeProps<DeviceNodeT>) {
  const def = getDevice(data.kind);
  const Icon = def.icon;
  const showLabels = useDesigner((s) => s.showLabels);
  return (
    <div className={`nd-device group ${selected ? "is-selected" : ""}`}>
      <Handles />
      <div
        className="nd-device-tile"
        style={{ background: `${def.color}1a`, color: def.color, borderColor: selected ? def.color : undefined }}
      >
        <Icon size={30} strokeWidth={1.75} />
        <span
          className="nd-status"
          style={{ background: STATUS_COLOR[data.status ?? "unknown"] }}
          title={`Status: ${data.status ?? "unknown"}`}
        />
        {data.vlan ? <span className="nd-vlan">V{data.vlan}</span> : null}
      </div>
      {showLabels && (
        <div className="nd-device-label">
          <div className="nd-device-name">{data.label}</div>
          {data.ip ? <div className="nd-device-ip">{data.ip}</div> : null}
        </div>
      )}
    </div>
  );
});

export const ZoneNode = memo(function ZoneNode({ id, data, selected }: NodeProps<ZoneNodeT>) {
  const snapshot = useDesigner((s) => s.snapshot);
  return (
    <div
      className="nd-zone"
      style={{
        borderColor: data.color,
        background: `${data.color}12`,
        boxShadow: selected ? `0 0 0 2px ${data.color}55` : undefined,
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={100}
        color={data.color}
        onResizeStart={() => snapshot()}
      />
      <div className="nd-zone-header" style={{ color: data.color }}>
        <span className="nd-zone-title">{data.label}</span>
        {data.subtitle ? <span className="nd-zone-sub">{data.subtitle}</span> : null}
      </div>
      <span className="sr-only">{id}</span>
    </div>
  );
});

export const NoteNode = memo(function NoteNode({ id, data, selected }: NodeProps<NoteNodeT>) {
  const update = useDesigner((s) => s.updateNodeData);
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);
  return (
    <div className={`nd-note ${selected ? "is-selected" : ""}`} onDoubleClick={() => setEditing(true)}>
      <Handles />
      {editing ? (
        <textarea
          ref={ref}
          className="nd-note-input nodrag nowheel"
          defaultValue={data.text}
          onBlur={(e) => {
            update(id, { text: e.target.value });
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") (e.target as HTMLTextAreaElement).blur();
          }}
        />
      ) : (
        <div className="nd-note-text">{data.text}</div>
      )}
    </div>
  );
});

export const nodeTypes = { device: DeviceNode, zone: ZoneNode, note: NoteNode };
