import {
  Antenna,
  BatteryCharging,
  Boxes,
  Building,
  Cctv,
  Cloud,
  Container,
  Database,
  Gamepad2,
  Globe,
  HardDrive,
  Laptop,
  Lightbulb,
  Mail,
  Monitor,
  Phone,
  Printer,
  RadioTower,
  Router,
  SatelliteDish,
  Server,
  ServerCog,
  ShieldCheck,
  ShieldExclamationPoint,
  Smartphone,
  Speaker,
  Tablet,
  Thermometer,
  Tv,
  Watch,
  Wifi,
  FingerprintPattern,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import {
  AccessPointIcon,
  BridgeIcon,
  CoreSwitchIcon,
  FirewallIcon,
  HubIcon,
  IotIcon,
  IspIcon,
  LoadBalancerIcon,
  MediaConverterIcon,
  MeshNodeIcon,
  ModemIcon,
  NvrIcon,
  OntIcon,
  PatchPanelIcon,
  PoeInjectorIcon,
  ProxyIcon,
  RackIcon,
  SanIcon,
  SdWanIcon,
  SwitchIcon,
  VpnIcon,
  WirelessControllerIcon,
} from "@/components/icons";

export type AnyIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

export type CategoryId =
  | "core"
  | "wireless"
  | "security"
  | "servers"
  | "endpoints"
  | "wan"
  | "infra";

export interface Category {
  id: CategoryId;
  label: string;
}

export const CATEGORIES: Category[] = [
  { id: "core", label: "Routing & Switching" },
  { id: "wireless", label: "Wireless" },
  { id: "security", label: "Security" },
  { id: "servers", label: "Servers & Storage" },
  { id: "wan", label: "WAN & Cloud" },
  { id: "endpoints", label: "End Devices" },
  { id: "infra", label: "Infrastructure & Power" },
];

export interface DeviceDef {
  kind: string;
  label: string;
  category: CategoryId;
  icon: AnyIcon;
  color: string;
  /** Has a radio – shows SSID / band / channel fields. */
  wireless?: boolean;
  /** Typical number of ports, used as a default. */
  ports?: number;
  keywords?: string;
}

const C = {
  router: "#2563eb",
  switch: "#0891b2",
  wireless: "#7c3aed",
  security: "#dc2626",
  server: "#475569",
  storage: "#0f766e",
  wan: "#0284c7",
  endpoint: "#16a34a",
  iot: "#ca8a04",
  infra: "#78716c",
};

export const DEVICES: DeviceDef[] = [
  // Routing & switching
  { kind: "router", label: "Router", category: "core", icon: Router, color: C.router, ports: 4, keywords: "gateway l3" },
  { kind: "core-switch", label: "Core / L3 Switch", category: "core", icon: CoreSwitchIcon, color: C.switch, ports: 48, keywords: "layer 3 distribution" },
  { kind: "switch", label: "Switch", category: "core", icon: SwitchIcon, color: C.switch, ports: 24, keywords: "access l2 ethernet" },
  { kind: "poe-switch", label: "PoE Switch", category: "core", icon: SwitchIcon, color: "#0d9488", ports: 24, keywords: "power over ethernet" },
  { kind: "hub", label: "Hub", category: "core", icon: HubIcon, color: C.switch, ports: 8 },
  { kind: "load-balancer", label: "Load Balancer", category: "core", icon: LoadBalancerIcon, color: "#4f46e5", keywords: "lb adc haproxy" },
  { kind: "modem", label: "Modem", category: "core", icon: ModemIcon, color: C.router, keywords: "dsl cable docsis" },
  { kind: "ont", label: "Fiber ONT", category: "core", icon: OntIcon, color: "#ea580c", keywords: "gpon ftth optical" },
  { kind: "media-converter", label: "Media Converter", category: "core", icon: MediaConverterIcon, color: "#ea580c", keywords: "sfp fiber copper" },

  // Wireless
  { kind: "access-point", label: "Access Point", category: "wireless", icon: AccessPointIcon, color: C.wireless, wireless: true, keywords: "ap wifi wlan" },
  { kind: "wifi-router", label: "Wi-Fi Router", category: "wireless", icon: Wifi, color: C.wireless, wireless: true, ports: 4, keywords: "home wireless router" },
  { kind: "wlc", label: "Wireless Controller", category: "wireless", icon: WirelessControllerIcon, color: C.wireless, keywords: "wlc controller" },
  { kind: "mesh-node", label: "Mesh Node", category: "wireless", icon: MeshNodeIcon, color: C.wireless, wireless: true, keywords: "satellite extender" },
  { kind: "range-extender", label: "Range Extender", category: "wireless", icon: Wifi, color: "#a855f7", wireless: true, keywords: "repeater booster" },
  { kind: "p2p-bridge", label: "P2P Wireless Bridge", category: "wireless", icon: BridgeIcon, color: C.wireless, wireless: true, keywords: "point to point ptp link" },
  { kind: "antenna", label: "Antenna", category: "wireless", icon: Antenna, color: C.wireless, wireless: true, keywords: "omni sector" },
  { kind: "cell-tower", label: "Cell Tower / 5G", category: "wireless", icon: RadioTower, color: "#9333ea", wireless: true, keywords: "lte 4g 5g cellular" },
  { kind: "satellite", label: "Satellite Dish", category: "wireless", icon: SatelliteDish, color: "#9333ea", wireless: true, keywords: "vsat starlink" },

  // Security
  { kind: "firewall", label: "Firewall", category: "security", icon: FirewallIcon, color: C.security, keywords: "ngfw utm" },
  { kind: "vpn-gateway", label: "VPN Gateway", category: "security", icon: VpnIcon, color: C.security, keywords: "ipsec wireguard tunnel" },
  { kind: "ids", label: "IDS / IPS", category: "security", icon: ShieldExclamationPoint, color: C.security, keywords: "intrusion detection prevention" },
  { kind: "proxy", label: "Proxy / WAF", category: "security", icon: ProxyIcon, color: "#b91c1c", keywords: "reverse proxy web application firewall" },
  { kind: "nac", label: "NAC / RADIUS", category: "security", icon: ShieldCheck, color: "#b91c1c", keywords: "802.1x authentication aaa" },
  { kind: "access-control", label: "Access Control", category: "security", icon: FingerprintPattern, color: "#b91c1c", keywords: "badge reader door" },
  { kind: "nvr", label: "NVR", category: "security", icon: NvrIcon, color: "#b91c1c", keywords: "cctv video recorder" },

  // Servers & storage
  { kind: "server", label: "Server", category: "servers", icon: Server, color: C.server, keywords: "host" },
  { kind: "web-server", label: "Web Server", category: "servers", icon: Globe, color: C.server, keywords: "http nginx apache" },
  { kind: "db-server", label: "Database", category: "servers", icon: Database, color: C.server, keywords: "sql db" },
  { kind: "mail-server", label: "Mail Server", category: "servers", icon: Mail, color: C.server, keywords: "smtp exchange" },
  { kind: "dc", label: "Domain Controller", category: "servers", icon: ServerCog, color: C.server, keywords: "ad dns dhcp ldap" },
  { kind: "hypervisor", label: "Hypervisor / VMs", category: "servers", icon: Boxes, color: C.server, keywords: "esxi proxmox virtual" },
  { kind: "container", label: "Container Cluster", category: "servers", icon: Container, color: C.server, keywords: "kubernetes docker k8s" },
  { kind: "nas", label: "NAS", category: "servers", icon: HardDrive, color: C.storage, keywords: "storage file share" },
  { kind: "san", label: "SAN", category: "servers", icon: SanIcon, color: C.storage, keywords: "storage array iscsi fc" },

  // WAN & cloud
  { kind: "internet", label: "Internet", category: "wan", icon: Globe, color: C.wan, keywords: "www public" },
  { kind: "cloud", label: "Cloud Service", category: "wan", icon: Cloud, color: C.wan, keywords: "aws azure gcp saas" },
  { kind: "isp", label: "ISP", category: "wan", icon: IspIcon, color: C.wan, keywords: "provider carrier" },
  { kind: "sd-wan", label: "SD-WAN Edge", category: "wan", icon: SdWanIcon, color: C.wan, keywords: "mpls branch" },
  { kind: "site", label: "Remote Site", category: "wan", icon: Building, color: C.wan, keywords: "branch office building" },

  // End devices
  { kind: "pc", label: "Desktop PC", category: "endpoints", icon: Monitor, color: C.endpoint, keywords: "workstation computer" },
  { kind: "laptop", label: "Laptop", category: "endpoints", icon: Laptop, color: C.endpoint, wireless: true, keywords: "notebook" },
  { kind: "smartphone", label: "Smartphone", category: "endpoints", icon: Smartphone, color: C.endpoint, wireless: true, keywords: "mobile phone" },
  { kind: "tablet", label: "Tablet", category: "endpoints", icon: Tablet, color: C.endpoint, wireless: true, keywords: "ipad" },
  { kind: "ip-phone", label: "IP Phone", category: "endpoints", icon: Phone, color: C.endpoint, keywords: "voip sip telephone" },
  { kind: "printer", label: "Printer", category: "endpoints", icon: Printer, color: C.endpoint, keywords: "mfp scanner" },
  { kind: "smart-tv", label: "Smart TV", category: "endpoints", icon: Tv, color: C.endpoint, wireless: true, keywords: "television display" },
  { kind: "ip-camera", label: "IP Camera", category: "endpoints", icon: Cctv, color: C.iot, keywords: "cctv surveillance" },
  { kind: "game-console", label: "Game Console", category: "endpoints", icon: Gamepad2, color: C.endpoint, keywords: "xbox playstation" },
  { kind: "smart-speaker", label: "Smart Speaker", category: "endpoints", icon: Speaker, color: C.iot, wireless: true, keywords: "assistant" },
  { kind: "wearable", label: "Wearable", category: "endpoints", icon: Watch, color: C.iot, wireless: true, keywords: "watch" },
  { kind: "iot", label: "IoT Device", category: "endpoints", icon: IotIcon, color: C.iot, wireless: true, keywords: "embedded smart home" },
  { kind: "sensor", label: "Sensor", category: "endpoints", icon: Thermometer, color: C.iot, wireless: true, keywords: "temperature zigbee" },
  { kind: "smart-light", label: "Smart Light", category: "endpoints", icon: Lightbulb, color: C.iot, wireless: true, keywords: "bulb lighting" },

  // Infrastructure
  { kind: "rack", label: "Rack / Cabinet", category: "infra", icon: RackIcon, color: C.infra, keywords: "enclosure" },
  { kind: "patch-panel", label: "Patch Panel", category: "infra", icon: PatchPanelIcon, color: C.infra, ports: 24 },
  { kind: "poe-injector", label: "PoE Injector", category: "infra", icon: PoeInjectorIcon, color: C.infra, keywords: "power" },
  { kind: "ups", label: "UPS", category: "infra", icon: BatteryCharging, color: C.infra, keywords: "battery power" },
];

export const DEVICE_MAP: Record<string, DeviceDef> = Object.fromEntries(
  DEVICES.map((d) => [d.kind, d]),
);

export function getDevice(kind: string): DeviceDef {
  return DEVICE_MAP[kind] ?? DEVICE_MAP.server;
}

/* ------------------------------------------------------------------ */
/* Link (cable / connection) types                                     */
/* ------------------------------------------------------------------ */

export interface LinkDef {
  type: string;
  label: string;
  group: "Copper" | "Fiber" | "Wireless" | "Logical";
  color: string;
  width: number;
  dash?: string;
  animated?: boolean;
  defaultBandwidth: string;
}

export const LINKS: LinkDef[] = [
  { type: "cat5e", label: "Ethernet Cat5e", group: "Copper", color: "#3b82f6", width: 2, defaultBandwidth: "1 Gbps" },
  { type: "cat6", label: "Ethernet Cat6", group: "Copper", color: "#2563eb", width: 2.5, defaultBandwidth: "1 Gbps" },
  { type: "cat6a", label: "Ethernet Cat6a", group: "Copper", color: "#1d4ed8", width: 3, defaultBandwidth: "10 Gbps" },
  { type: "poe", label: "PoE Ethernet", group: "Copper", color: "#ca8a04", width: 2.5, defaultBandwidth: "1 Gbps" },
  { type: "coax", label: "Coaxial", group: "Copper", color: "#57534e", width: 3, defaultBandwidth: "1 Gbps" },
  { type: "dac", label: "DAC (Twinax)", group: "Copper", color: "#0f766e", width: 3, defaultBandwidth: "25 Gbps" },
  { type: "serial", label: "Serial / Console", group: "Copper", color: "#64748b", width: 1.5, dash: "2 3", defaultBandwidth: "9600 bps" },
  { type: "fiber-sm", label: "Fiber (Single-mode)", group: "Fiber", color: "#eab308", width: 3, defaultBandwidth: "10 Gbps" },
  { type: "fiber-mm", label: "Fiber (Multi-mode)", group: "Fiber", color: "#06b6d4", width: 3, defaultBandwidth: "10 Gbps" },
  { type: "wifi", label: "Wi-Fi", group: "Wireless", color: "#8b5cf6", width: 2, dash: "6 5", animated: true, defaultBandwidth: "Wi-Fi 6" },
  { type: "p2p", label: "Wireless P2P", group: "Wireless", color: "#a855f7", width: 2.5, dash: "10 5", animated: true, defaultBandwidth: "1 Gbps" },
  { type: "cellular", label: "Cellular (4G/5G)", group: "Wireless", color: "#d946ef", width: 2, dash: "4 4", animated: true, defaultBandwidth: "5G" },
  { type: "satellite", label: "Satellite", group: "Wireless", color: "#ec4899", width: 2, dash: "1 6", animated: true, defaultBandwidth: "200 Mbps" },
  { type: "bluetooth", label: "Bluetooth / Zigbee", group: "Wireless", color: "#6366f1", width: 1.5, dash: "2 4", animated: true, defaultBandwidth: "" },
  { type: "wan", label: "WAN / Internet", group: "Logical", color: "#ef4444", width: 3, defaultBandwidth: "500 Mbps" },
  { type: "vpn", label: "VPN Tunnel", group: "Logical", color: "#16a34a", width: 2.5, dash: "8 4 2 4", animated: true, defaultBandwidth: "IPsec" },
  { type: "trunk", label: "Trunk / LAG", group: "Logical", color: "#0ea5e9", width: 4.5, defaultBandwidth: "2×10 Gbps" },
];

export const LINK_MAP: Record<string, LinkDef> = Object.fromEntries(LINKS.map((l) => [l.type, l]));

export function getLink(type: string | undefined): LinkDef {
  return LINK_MAP[type ?? ""] ?? LINK_MAP.cat6;
}

export const ZONE_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#ef4444",
  "#f59e0b",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
  "#64748b",
];
