import { getLink } from "./catalog";
import type { AppEdge, AppNode, DesignDoc, DeviceData } from "./types";

type Side = "t" | "r" | "b" | "l";

class Builder {
  nodes: AppNode[] = [];
  edges: AppEdge[] = [];
  private n = 0;

  zone(label: string, subtitle: string, color: string, x: number, y: number, w: number, h: number) {
    const id = `z${++this.n}`;
    this.nodes.push({
      id,
      type: "zone",
      position: { x, y },
      width: w,
      height: h,
      zIndex: -1,
      data: { kind: "zone", label, subtitle, color },
    });
    return id;
  }

  device(kind: string, label: string, x: number, y: number, extra: Partial<DeviceData> = {}) {
    const id = `d${++this.n}`;
    this.nodes.push({ id, type: "device", position: { x, y }, data: { kind, label, status: "up", ...extra } });
    return id;
  }

  note(text: string, x: number, y: number) {
    const id = `t${++this.n}`;
    this.nodes.push({ id, type: "note", position: { x, y }, data: { kind: "note", text } });
    return id;
  }

  link(a: string, b: string, type: string, sides: [Side, Side] = ["b", "t"], extra: Partial<AppEdge["data"]> = {}) {
    const def = getLink(type);
    this.edges.push({
      id: `e${++this.n}`,
      type: "link",
      source: a,
      target: b,
      sourceHandle: sides[0],
      targetHandle: sides[1],
      data: { linkType: type, bandwidth: def.defaultBandwidth, ...extra },
    });
  }

  doc(name: string): DesignDoc {
    return {
      app: "network-designer",
      version: 1,
      name,
      nodes: [...this.nodes.filter((n) => n.type === "zone"), ...this.nodes.filter((n) => n.type !== "zone")],
      edges: this.edges,
    };
  }
}

function home(): DesignDoc {
  const b = new Builder();
  b.zone("Home LAN", "192.168.1.0/24", "#22c55e", 40, 280, 900, 470);
  const inet = b.device("internet", "Internet", 420, 0);
  const ont = b.device("ont", "Fiber ONT", 420, 150, { vendor: "ISP" });
  const rtr = b.device("wifi-router", "Home Router", 420, 330, {
    ip: "192.168.1.1",
    subnet: "255.255.255.0",
    ssid: "HomeNet",
    band: "2.4 / 5 GHz",
  });
  const sw = b.device("switch", "Desk Switch", 160, 470, { ports: "8" });
  const pc = b.device("pc", "Desktop PC", 70, 620, { ip: "192.168.1.20" });
  const nas = b.device("nas", "NAS", 250, 620, { ip: "192.168.1.10" });
  const mesh = b.device("mesh-node", "Mesh Node", 680, 470, { ssid: "HomeNet" });
  const laptop = b.device("laptop", "Laptop", 470, 620);
  const phone = b.device("smartphone", "Phone", 590, 620);
  const tv = b.device("smart-tv", "Living Room TV", 720, 620);
  const cam = b.device("ip-camera", "Door Camera", 840, 620);
  const spk = b.device("smart-speaker", "Speaker", 840, 340);

  b.link(inet, ont, "fiber-sm", ["b", "t"], { bandwidth: "1 Gbps" });
  b.link(ont, rtr, "cat6", ["b", "t"]);
  b.link(rtr, sw, "cat6", ["l", "t"]);
  b.link(sw, pc, "cat5e");
  b.link(sw, nas, "cat6");
  b.link(rtr, mesh, "p2p", ["r", "t"], { label: "Wireless backhaul", bandwidth: "" });
  b.link(rtr, laptop, "wifi", ["b", "t"]);
  b.link(rtr, phone, "wifi", ["b", "t"]);
  b.link(mesh, tv, "wifi");
  b.link(mesh, cam, "wifi");
  b.link(mesh, spk, "wifi", ["t", "b"]);
  return b.doc("Home network");
}

function smallOffice(): DesignDoc {
  const b = new Builder();
  b.zone("VLAN 10 · Staff", "10.10.10.0/24", "#3b82f6", 0, 470, 560, 330);
  b.zone("VLAN 20 · Servers", "10.10.20.0/24", "#a855f7", 620, 470, 430, 330);
  b.zone("VLAN 30 · Guest Wi-Fi", "10.10.30.0/24", "#f59e0b", 1110, 470, 380, 330);

  const isp = b.device("isp", "ISP", 640, 0);
  const fw = b.device("firewall", "Edge Firewall", 640, 150, { ip: "203.0.113.2", vendor: "Fortinet", model: "FG-60F" });
  const core = b.device("core-switch", "Core Switch", 640, 310, { ip: "10.10.0.2", ports: "24" });
  const ups = b.device("ups", "UPS", 900, 310);

  const acc = b.device("poe-switch", "Access Switch", 220, 530, { ip: "10.10.10.2", vlan: "10" });
  const pc1 = b.device("pc", "Workstation 1", 30, 680, { ip: "10.10.10.21", vlan: "10" });
  const pc2 = b.device("pc", "Workstation 2", 160, 680, { ip: "10.10.10.22", vlan: "10" });
  const tel = b.device("ip-phone", "IP Phone", 290, 680, { vlan: "10" });
  const prn = b.device("printer", "Printer", 420, 680, { ip: "10.10.10.50", vlan: "10" });

  const dc = b.device("dc", "DC01", 650, 680, { ip: "10.10.20.10", vlan: "20" });
  const srv = b.device("server", "App Server", 790, 680, { ip: "10.10.20.20", vlan: "20" });
  const nas = b.device("nas", "Backup NAS", 930, 680, { ip: "10.10.20.30", vlan: "20" });
  const srvsw = b.device("switch", "Server Switch", 790, 530, { vlan: "20" });

  const ap = b.device("access-point", "AP Lobby", 1240, 530, { ssid: "Office-Guest", band: "5 GHz", channel: "36", vlan: "30" });
  const g1 = b.device("laptop", "Guest Laptop", 1150, 680);
  const g2 = b.device("smartphone", "Guest Phone", 1290, 680);
  const g3 = b.device("tablet", "Tablet", 1410, 680);

  const cloud = b.device("cloud", "Microsoft 365", 1000, 0);

  b.link(isp, fw, "wan", ["b", "t"]);
  b.link(fw, core, "cat6a", ["b", "t"], { label: "Trunk 10/20/30" });
  b.link(isp, cloud, "wan", ["r", "l"], { bandwidth: "SaaS" });
  b.link(core, ups, "serial", ["r", "l"], { label: "USB/SNMP", bandwidth: "" });
  b.link(core, acc, "trunk", ["l", "t"]);
  b.link(core, srvsw, "fiber-mm", ["b", "t"]);
  b.link(core, ap, "poe", ["r", "t"], { vlans: "30" });
  b.link(acc, pc1, "cat6");
  b.link(acc, pc2, "cat6");
  b.link(acc, tel, "poe");
  b.link(acc, prn, "cat6");
  b.link(srvsw, dc, "cat6a");
  b.link(srvsw, srv, "cat6a");
  b.link(srvsw, nas, "cat6a");
  b.link(ap, g1, "wifi");
  b.link(ap, g2, "wifi");
  b.link(ap, g3, "wifi");
  return b.doc("Small office");
}

function enterprise(): DesignDoc {
  const b = new Builder();
  b.zone("DMZ", "172.16.0.0/24", "#ef4444", 1080, 220, 470, 300);
  b.zone("Data Center", "10.0.10.0/23", "#a855f7", 1080, 600, 600, 330);
  b.zone("Campus Access", "10.20.0.0/16", "#3b82f6", -40, 600, 1060, 330);
  b.zone("Branch Office", "10.50.0.0/24", "#22c55e", -40, 0, 420, 260);

  const isp1 = b.device("isp", "ISP A", 420, 0);
  const isp2 = b.device("isp", "ISP B", 700, 0);
  const cloud = b.device("cloud", "Public Cloud (VPC)", 1000, 0);
  const r1 = b.device("router", "Edge Router A", 420, 150, { ip: "198.51.100.1" });
  const r2 = b.device("router", "Edge Router B", 700, 150, { ip: "198.51.100.2" });
  const fw1 = b.device("firewall", "Firewall A", 420, 300);
  const fw2 = b.device("firewall", "Firewall B", 700, 300);
  const c1 = b.device("core-switch", "Core 1", 420, 450, { ip: "10.0.0.1" });
  const c2 = b.device("core-switch", "Core 2", 700, 450, { ip: "10.0.0.2" });

  const lb = b.device("load-balancer", "Load Balancer", 1130, 290, { ip: "172.16.0.10" });
  const web1 = b.device("web-server", "Web 1", 1290, 400, { ip: "172.16.0.21" });
  const web2 = b.device("web-server", "Web 2", 1420, 400, { ip: "172.16.0.22" });
  const waf = b.device("proxy", "WAF", 1300, 260);

  const dcsw = b.device("switch", "DC Leaf", 1300, 650);
  const hv = b.device("hypervisor", "VM Cluster", 1110, 800);
  const k8s = b.device("container", "K8s Cluster", 1240, 800);
  const db = b.device("db-server", "SQL Cluster", 1370, 800);
  const san = b.device("san", "SAN", 1500, 800);
  const ids = b.device("ids", "IDS", 1540, 650);

  const wlc = b.device("wlc", "Wireless Controller", 560, 650);
  const dist1 = b.device("switch", "Access SW 1", 120, 650);
  const dist2 = b.device("poe-switch", "Access SW 2", 340, 650);
  const ap1 = b.device("access-point", "AP-1F", 760, 650, { ssid: "Corp", band: "Wi-Fi 6E" });
  const ap2 = b.device("access-point", "AP-2F", 900, 650, { ssid: "Corp", band: "Wi-Fi 6E" });
  const pc = b.device("pc", "Workstations", 0, 800);
  const prn = b.device("printer", "Printers", 130, 800);
  const ph = b.device("ip-phone", "IP Phones", 260, 800);
  const cam = b.device("ip-camera", "Cameras", 390, 800);
  const nac = b.device("nac", "RADIUS / NAC", 520, 800);
  const lap = b.device("laptop", "Laptops", 760, 800);
  const mob = b.device("smartphone", "Mobiles", 900, 800);

  const vpn = b.device("vpn-gateway", "Branch VPN", 140, 40);
  const bsw = b.device("switch", "Branch Switch", 0, 150);
  const bap = b.device("access-point", "Branch AP", 140, 150);
  const bpc = b.device("laptop", "Branch Users", 280, 150);

  b.link(isp1, r1, "wan");
  b.link(isp2, r2, "wan");
  b.link(r1, fw1, "cat6a");
  b.link(r2, fw2, "cat6a");
  b.link(fw1, fw2, "dac", ["r", "l"], { label: "HA sync" });
  b.link(fw1, c1, "fiber-sm");
  b.link(fw2, c2, "fiber-sm");
  b.link(c1, c2, "trunk", ["r", "l"], { label: "vPC peer" });
  b.link(fw2, lb, "fiber-mm", ["r", "l"]);
  b.link(lb, waf, "cat6a", ["r", "l"]);
  b.link(lb, web1, "cat6a", ["b", "t"]);
  b.link(lb, web2, "cat6a", ["b", "t"]);
  b.link(c2, dcsw, "fiber-mm", ["r", "l"], { bandwidth: "40 Gbps" });
  b.link(dcsw, hv, "dac");
  b.link(dcsw, k8s, "dac");
  b.link(dcsw, db, "dac");
  b.link(dcsw, san, "fiber-mm", ["b", "t"], { label: "iSCSI" });
  b.link(dcsw, ids, "cat6a", ["r", "l"], { label: "SPAN" });
  b.link(c1, dist1, "fiber-mm", ["l", "t"]);
  b.link(c1, dist2, "fiber-mm", ["b", "t"]);
  b.link(c2, wlc, "cat6a", ["b", "t"]);
  b.link(c2, ap1, "poe", ["b", "t"]);
  b.link(c2, ap2, "poe", ["b", "t"]);
  b.link(dist1, pc, "cat6");
  b.link(dist1, prn, "cat6");
  b.link(dist2, ph, "poe");
  b.link(dist2, cam, "poe");
  b.link(dist2, nac, "cat6");
  b.link(ap1, lap, "wifi");
  b.link(ap2, mob, "wifi");
  b.link(r1, cloud, "vpn", ["t", "b"], { label: "IPsec to VPC" });
  b.link(vpn, r1, "vpn", ["r", "l"], { label: "Site-to-site" });
  b.link(vpn, bsw, "cat6", ["b", "t"]);
  b.link(vpn, bap, "poe", ["b", "t"]);
  b.link(bap, bpc, "wifi", ["r", "l"]);
  b.note("Dual ISP, HA firewalls and redundant core.\nDouble-click any note to edit.", 1100, 60);
  return b.doc("Enterprise campus");
}

function wisp(): DesignDoc {
  const b = new Builder();
  const inet = b.device("internet", "Upstream", 380, 0);
  const tower = b.device("cell-tower", "Main Tower", 380, 160, { notes: "Sector antennas 120°" });
  const br1 = b.device("p2p-bridge", "PtP to Hilltop", 120, 330, { band: "60 GHz" });
  const br2 = b.device("p2p-bridge", "PtP to Farm", 640, 330, { band: "5 GHz" });
  const hill = b.device("antenna", "Hilltop Sector", 120, 500);
  const farm = b.device("antenna", "Farm CPE", 640, 500);
  const h1 = b.device("wifi-router", "House A", 0, 660);
  const h2 = b.device("wifi-router", "House B", 240, 660);
  const barn = b.device("switch", "Barn Switch", 640, 660);
  const sensor = b.device("sensor", "Soil Sensors", 520, 820);
  const cam = b.device("ip-camera", "Barn Camera", 760, 820);
  const sat = b.device("satellite", "Backup Satellite", 760, 160);

  b.link(inet, tower, "fiber-sm");
  b.link(inet, sat, "satellite", ["r", "t"], { label: "Failover" });
  b.link(sat, tower, "cat6", ["l", "r"]);
  b.link(tower, br1, "p2p", ["l", "t"]);
  b.link(tower, br2, "p2p", ["r", "t"]);
  b.link(br1, hill, "cat6");
  b.link(br2, farm, "cat6");
  b.link(hill, h1, "p2p");
  b.link(hill, h2, "p2p");
  b.link(farm, barn, "poe");
  b.link(barn, sensor, "bluetooth");
  b.link(barn, cam, "poe");
  return b.doc("Rural wireless ISP");
}

export const TEMPLATES: { id: string; name: string; description: string; build: () => DesignDoc }[] = [
  { id: "home", name: "Home network", description: "Fiber ONT, Wi-Fi router, mesh node and smart devices", build: home },
  { id: "office", name: "Small office", description: "Firewall, core switch, three VLANs, servers and guest Wi-Fi", build: smallOffice },
  { id: "enterprise", name: "Enterprise campus", description: "Dual ISP, HA firewalls, DMZ, data center, campus and branch VPN", build: enterprise },
  { id: "wisp", name: "Rural wireless ISP", description: "Towers, point-to-point bridges, satellite failover and IoT", build: wisp },
];
