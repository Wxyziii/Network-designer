import type { SVGProps } from "react";

/**
 * Custom network icons drawn on a 24×24 grid with the same stroke style as
 * lucide-react, so they sit naturally next to lucide icons.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

function Svg({ size = 24, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export type IconComponent = (props: IconProps) => React.ReactElement;

export const SwitchIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 10h11m-2.5-2.5L17 10l-2.5 2.5" />
    <path d="M18 14H7m2.5-2.5L7 14l2.5 2.5" />
  </Svg>
);

export const CoreSwitchIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M12 7v10M7 12h10" />
    <path d="m10.5 8.5 1.5-1.5 1.5 1.5M10.5 15.5l1.5 1.5 1.5-1.5M8.5 10.5 7 12l1.5 1.5M15.5 10.5 17 12l-1.5 1.5" />
  </Svg>
);

export const AccessPointIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="4" y="15" width="16" height="5" rx="2.5" />
    <path d="M8 17.5h.01" />
    <path d="M9 11.5a4.2 4.2 0 0 1 6 0" />
    <path d="M6.2 8.6a8.2 8.2 0 0 1 11.6 0" />
    <path d="M3.5 5.7a12 12 0 0 1 17 0" />
  </Svg>
);

export const FirewallIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="1.5" />
    <path d="M3 9.33h18M3 14.67h18" />
    <path d="M9 4v5.33M15 4v5.33M6 9.33v5.34M12 9.33v5.34M18 9.33v5.34M9 14.67V20M15 14.67V20" />
  </Svg>
);

export const LoadBalancerIcon: IconComponent = (p) => (
  <Svg {...p}>
    <circle cx="5" cy="12" r="2" />
    <path d="M7 12h3l4-6h5M10 12h9M10 12l4 6h5" />
    <path d="m17 4 2 2-2 2M17 10l2 2-2 2M17 16l2 2-2 2" />
  </Svg>
);

export const PatchPanelIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="2" y="8" width="20" height="8" rx="1" />
    <path d="M5 11h2v2H5zM9 11h2v2H9zM13 11h2v2h-2zM17 11h2v2h-2z" />
  </Svg>
);

export const ModemIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="3" y="11" width="18" height="8" rx="2" />
    <path d="M7 15h.01M10 15h.01M13 15h.01M16 15h2" />
    <path d="M8 11 6 5M16 11l2-6" />
  </Svg>
);

export const OntIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="4" y="9" width="16" height="11" rx="2" />
    <path d="M8 13h.01M11 13h.01M14 13h.01" />
    <path d="M8 17h8" />
    <path d="M12 9V3M10 5l2-2 2 2" />
  </Svg>
);

export const WirelessControllerIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="2" y="14" width="20" height="6" rx="1.5" />
    <path d="M6 17h.01M9 17h.01M14 17h4" />
    <path d="M9.5 9.5a3.5 3.5 0 0 1 5 0" />
    <path d="M7 7a7 7 0 0 1 10 0" />
    <path d="M12 11.5v2.5" />
  </Svg>
);

export const MeshNodeIcon: IconComponent = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="5" r="2.5" />
    <circle cx="5" cy="18" r="2.5" />
    <circle cx="19" cy="18" r="2.5" />
    <path d="M10.8 7.2 6.2 15.8M13.2 7.2l4.6 8.6M7.5 18h9" strokeDasharray="2 2" />
  </Svg>
);

export const BridgeIcon: IconComponent = (p) => (
  <Svg {...p}>
    <path d="M4 20V10M20 20V10" />
    <rect x="2" y="5" width="4" height="5" rx="1" />
    <rect x="18" y="5" width="4" height="5" rx="1" />
    <path d="M8 6.5a6 6 0 0 1 3 0M13 6.5a6 6 0 0 1 3 0" />
    <path d="M2 20h4M18 20h4" />
  </Svg>
);

export const RackIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="5" y="2" width="14" height="20" rx="1.5" />
    <path d="M5 7h14M5 12h14M5 17h14" />
    <path d="M8 4.5h.01M8 9.5h.01M8 14.5h.01M8 19.5h.01" />
  </Svg>
);

export const HubIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="2" y="8" width="20" height="8" rx="2" />
    <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01" />
    <path d="M6 8V5M12 8V5M18 8V5" />
  </Svg>
);

export const MediaConverterIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="6" y="7" width="12" height="10" rx="2" />
    <path d="M2 12h4M18 12h4" />
    <path d="m10 10 2 2-2 2M14 10l-2 2 2 2" />
  </Svg>
);

export const PoeInjectorIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <path d="m13 8-3 4h4l-3 4" />
    <path d="M1 12h3M20 12h3" />
  </Svg>
);

export const SanIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="5" rx="1" />
    <rect x="3" y="10" width="18" height="5" rx="1" />
    <path d="M7 5.5h.01M7 12.5h.01M11 5.5h7M11 12.5h7" />
    <path d="M12 15v3M6 21h12M12 18v3" />
  </Svg>
);

export const NvrIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="2" y="12" width="20" height="8" rx="1.5" />
    <path d="M6 16h.01M10 16h8" />
    <path d="M5 8.5 15 5l1 3-10 3.5z" />
    <path d="M16 6.5l3-1v4l-3-1" />
  </Svg>
);

export const VpnIcon: IconComponent = (p) => (
  <Svg {...p}>
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z" />
    <rect x="9" y="11" width="6" height="5" rx="1" />
    <path d="M10 11V9a2 2 0 0 1 4 0v2" />
  </Svg>
);

export const IspIcon: IconComponent = (p) => (
  <Svg {...p}>
    <path d="M6.5 19a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 17.6 9a4.5 4.5 0 0 1 .4 10z" />
    <path d="M9 14h6M12 11v6" />
  </Svg>
);

export const ProxyIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="8" y="8" width="8" height="8" rx="1.5" />
    <path d="M2 12h6M16 12h6M5 9l-3 3 3 3M19 9l3 3-3 3" />
  </Svg>
);

export const SdWanIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="3" y="13" width="18" height="7" rx="2" />
    <path d="M7 16.5h.01M11 16.5h6" />
    <path d="M6 13V9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4" />
    <path d="M12 6V3" />
  </Svg>
);

export const IotIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="7" y="7" width="10" height="10" rx="2" />
    <path d="M10 10h4v4h-4z" />
    <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
  </Svg>
);

export const ZoneIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 2.5" />
    <path d="M7 7h5" />
  </Svg>
);
