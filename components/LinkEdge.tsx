"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import { memo } from "react";
import { getLink } from "@/lib/catalog";
import { useDesigner } from "@/lib/store";
import type { AppEdge } from "@/lib/types";

export const LinkEdge = memo(function LinkEdge(props: EdgeProps<AppEdge>) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected } = props;
  const pathStyle = useDesigner((s) => s.edgePath);
  const showLabels = useDesigner((s) => s.showLabels);
  const def = getLink(data?.linkType);

  const args = { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition };
  const [path, labelX, labelY] =
    pathStyle === "bezier"
      ? getBezierPath(args)
      : pathStyle === "straight"
        ? getStraightPath(args)
        : getSmoothStepPath({ ...args, borderRadius: 12 });

  const text = [data?.label, data?.bandwidth].filter(Boolean).join(" · ");

  return (
    <>
      {selected && (
        <path d={path} fill="none" stroke={def.color} strokeOpacity={0.25} strokeWidth={def.width + 8} />
      )}
      <BaseEdge
        id={id}
        path={path}
        interactionWidth={18}
        className={def.animated ? "nd-edge-animated" : undefined}
        style={{
          stroke: def.color,
          strokeWidth: def.width + (selected ? 1 : 0),
          strokeDasharray: def.dash,
        }}
      />
      {showLabels && text && (
        <EdgeLabelRenderer>
          <div
            className={`nd-edge-label nodrag nopan ${selected ? "is-selected" : ""}`}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              borderColor: def.color,
            }}
          >
            <span className="nd-edge-dot" style={{ background: def.color }} />
            {text}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

export const edgeTypes = { link: LinkEdge };
