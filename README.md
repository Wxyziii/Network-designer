# Network Designer

An interactive, browser-based network topology designer for wired, wireless, fiber, WAN and cloud networks.
It is built with Next.js, React Flow and Tailwind CSS and deploys to Vercel with no configuration.

## Features

- **57 device types** in 7 categories: routing and switching, wireless, security, servers and storage, WAN and cloud, end devices, and infrastructure and power.
- **17 connection types**, each drawn with its own colour and line style:
  - Copper: Cat5e, Cat6, Cat6a, PoE, coax, DAC, serial
  - Fiber: single-mode, multi-mode
  - Wireless: Wi-Fi, point-to-point, cellular, satellite, Bluetooth/Zigbee
  - Logical: WAN, VPN tunnel, trunk/LAG
- **Drag and drop** from the palette, or click a palette item to drop it in the centre of the view. Connect devices by dragging from any of the four connection dots on a device.
- **Zones** for VLANs, subnets, a DMZ or a building. They can be resized and recoloured, and they sit behind your devices.
- **Sticky notes** you can edit by double-clicking.
- **Properties panel** for devices (name, hostname, IP, mask, gateway, VLAN, MAC, status, SSID/band/channel, vendor/model, ports, notes) and for links (type, label, bandwidth, length, tagged VLANs).
- **Report** that runs design checks (IP conflicts, invalid IPs or MACs, unconnected devices, more cables than ports, wireless links with no radio) and lists a bill of materials, with a CSV inventory export.
- **Templates:** home network, small office, enterprise campus and a rural wireless ISP.
- **Export** to PNG, SVG or project JSON, and **import** JSON (you can also drop the file onto the canvas).
- **Autosave** to your browser's localStorage, plus undo/redo, copy/paste/duplicate, snap-to-grid, three line routing styles, a minimap, dark mode and a mobile layout.

### Keyboard shortcuts

| Keys | Action |
| --- | --- |
| Ctrl/⌘ Z, Ctrl/⌘ Shift Z (or Ctrl Y) | Undo, redo |
| Ctrl/⌘ C, V, D | Copy, paste, duplicate |
| Ctrl/⌘ A | Select all |
| Delete / Backspace | Delete the selection |
| Ctrl/⌘ S | Download project JSON |
| 1–9 | Choose the connection type for new links |
| Shift + drag | Box select |

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the detected **Next.js** preset and click **Deploy**.

You don't need any environment variables. The app is fully static and keeps all data in the browser.

## Project structure

```
app/                 Next.js app router (layout, page, global styles)
components/
  Designer.tsx       Canvas, panels, shortcuts, drag & drop
  Palette.tsx        Device palette with search
  Inspector.tsx      Properties panel
  Toolbar.tsx        Top toolbar and menus
  Modals.tsx         Templates, report, help dialogs
  nodes.tsx          Device, zone and note nodes
  LinkEdge.tsx       Styled connection edge
  icons.tsx          Custom network icons
lib/
  catalog.ts         Device and connection-type definitions
  store.ts           Zustand store: state, history, persistence
  templates.ts       Starter designs
  analysis.ts        Design checks and bill of materials
  exporters.ts       PNG/SVG/JSON/CSV export and import
```
