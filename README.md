# 🎙️ Ghammas Baladi Radio — Branded Web Player

| Page | Link | Who it's for |
|---|---|---|
| **Public / demo player** | https://ahmad-aljaml.github.io/ghammas-radio/ | Committee, management, demos |
| **Branch player (kiosk)** | https://ahmad-aljaml.github.io/ghammas-radio/?branch=abdoun · `tabarbour` · `rabieh` | The device in each restaurant |
| **Operations monitor** | https://ahmad-aljaml.github.io/ghammas-radio/dashboard.html | Management: which branches are connected right now |

> Branch names are demo values and can be renamed in `config.js`.

A branded web player for a **centralized in-store radio system** that keeps all restaurant branches playing the same music at (almost) the same moment, managed from one place.
Built as a technical prototype for the **CDR Group (Al Qubtan Restaurants – Ghammas Baladi)** practical assessment.

---

## 🏗️ Architecture

```
 Admin (browser) ──► AzuraCast admin panel (upload / playlists / schedule)
                              │
                 ┌────────────┴─────────────┐
                 │  AWS EC2 · Ubuntu 24.04  │   Elastic IP + DuckDNS + Let's Encrypt (HTTPS)
                 │  Docker → AzuraCast      │   Security Group: 22 / 80 / 443 only
                 │   Liquidsoap (AutoDJ)    │
                 │        ▼                 │
                 │   Icecast  /radio.mp3    │   128 kbps MP3 via web proxy on 443
                 └────────────┬─────────────┘
                              │ HTTPS
      ┌───────────────────────┼───────────────────────┐
      ▼                       ▼                       ▼
  Branch 1                Branch 2                Branch N
  (this player / VLC)     (this player / VLC)     (this player / VLC)
```

This is a **static front-end** (no build step) hosted on GitHub Pages:

| File | Role |
|---|---|
| `config.js` | **The only file to edit**: server URL, branches (id, name, mount), program labels, fallback schedule |
| `common.js` | Shared logic: API access, Amman-time helpers, schedule building & rendering |
| `styles.css` | Shared design |
| `index.html` | Player (public mode + branch kiosk mode) |
| `dashboard.html` | Read-only operations monitor |

**One mount per branch.** Each branch listens on its own Icecast mount (`/abdoun.mp3`, `/tabarbour.mp3`, `/rabieh.mp3`). All mounts are fed by the **same Liquidsoap source** (shared encoder), so every branch hears the same song at the same moment, while the public API reports **listeners per mount**, which is how the monitor knows which branch is online, using real data and no secret keys. For 100+ branches, a heartbeat backend would replace per-branch mounts.

It talks to the AzuraCast server only through:

| Endpoint | Purpose |
|---|---|
| `/listen/ghammas/radio.mp3` | Public live stream |
| `/listen/ghammas/{branch}.mp3` | Per-branch live stream (same audio) |
| `/api/nowplaying_static/ghammas.json` | Now playing / up next / listeners (cached, lightweight) |
| `/api/nowplaying/ghammas` | Fallback if the static file is unavailable |
| `/api/station/ghammas/schedule` | Daily schedule, so the page follows changes made in the admin panel |

---

## ✨ Features

| Feature | Why it matters for branches |
|---|---|
| **Live sync button** | Reconnects to the *live edge* of the stream (cache-busting URL) to remove accumulated buffer delay |
| **Auto-reconnect with exponential backoff** (1 → 2 → 4 → 8 → 15 s) | Survives Wi-Fi drops without staff intervention, without hammering the server |
| **Watchdog** | If audio stops advancing for 8 s while it should be playing, it reconnects automatically |
| **Online/offline detection** | Reconnects immediately when the network returns |
| **Now playing, up next, progress bar** | Polls the AzuraCast API every 10 s, interpolates progress locally every second |
| **Daily schedule** (Asia/Amman) | Read from the AzuraCast schedule API (falls back to config); gaps are filled with the fallback rotation; current period highlighted with remaining time |
| **Branch kiosk mode** (`?branch=abdoun`) | Plays the branch's own mount; **no pause, no volume** (volume is on the amplifier), shows connection state, uptime and reconnect count instead of listener numbers |
| **Operations monitor** | Branch online/offline from per-mount listeners, now playing, current program, schedule, and an event log ("Abdoun connected") |
| **Screen Wake Lock** | Keeps the branch device's screen from sleeping |
| **Listeners counter** | Shows how many branch devices are connected right now |
| **One-tap start overlay** | Required by browser autoplay policies; after that everything is automatic |

---

## ⚙️ Configuration

All settings are at the top of the `<script>` block:

Everything lives in `config.js`:

```js
base: "https://ghammas-radio.duckdns.org",   // change this if the server moves
branches: [
  { id: "abdoun", name: "فرع عبدون", mount: "/abdoun.mp3" },
  // add a branch = add one line + one mount in AzuraCast
],
```

Because the domain is a DNS name (not a raw IP), the backend can move to another cloud (e.g. Oracle Cloud) **without changing this page**.

---

## 🎵 Music & licensing

Demo tracks are from **Pixabay Music** (Pixabay Content License). Playing commercial music publicly in restaurants requires a public-performance license — a business/legal decision for production use.

---

## 📄 License

**All rights reserved.** © 2026 Ahmad Al-Jamal.
No open-source license is granted. Ownership and usage rights of the code are subject to a separate written agreement, as stated in the assessment terms.
