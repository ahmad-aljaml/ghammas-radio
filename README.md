# 🎙️ Ghammas Baladi Radio — Branded Web Player

**Live:** https://ahmad-aljaml.github.io/ghammas-radio/
**Branch mode:** https://ahmad-aljaml.github.io/ghammas-radio/?branch=Abdoun

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

This page is a **static front-end** (single `index.html`, no build step) hosted on GitHub Pages. It talks to the AzuraCast server only through:

| Endpoint | Purpose |
|---|---|
| `/listen/ghammas/radio.mp3` | The live audio stream (same stream for every branch) |
| `/api/nowplaying_static/ghammas.json` | Now playing / up next / listeners (cached, lightweight) |
| `/api/nowplaying/ghammas` | Fallback if the static file is unavailable |

---

## ✨ Features

| Feature | Why it matters for branches |
|---|---|
| **Live sync button** | Reconnects to the *live edge* of the stream (cache-busting URL) to remove accumulated buffer delay |
| **Auto-reconnect with exponential backoff** (1 → 2 → 4 → 8 → 15 s) | Survives Wi-Fi drops without staff intervention, without hammering the server |
| **Watchdog** | If audio stops advancing for 8 s while it should be playing, it reconnects automatically |
| **Online/offline detection** | Reconnects immediately when the network returns |
| **Now playing, up next, progress bar** | Polls the AzuraCast API every 10 s, interpolates progress locally every second |
| **Daily schedule view** (Asia/Amman) | Shows Morning Cafe (8–17), Evening Jazz (17–24) and the fallback rotation, with a live "now" marker |
| **Branch mode** (`?branch=Name`) | Each branch device opens its own link and shows its branch name |
| **Screen Wake Lock** | Keeps the branch device's screen from sleeping |
| **Listeners counter** | Shows how many branch devices are connected right now |
| **One-tap start overlay** | Required by browser autoplay policies; after that everything is automatic |

---

## ⚙️ Configuration

All settings are at the top of the `<script>` block:

```js
const BASE     = "https://ghammas-radio.duckdns.org"; // change this if the server moves
const STATION  = "ghammas";
const POLL_MS  = 10000;   // metadata refresh
const STALL_MS = 8000;    // watchdog threshold
```

Because the domain is a DNS name (not a raw IP), the backend can move to another cloud (e.g. Oracle Cloud) **without changing this page**.

---

## 🎵 Music & licensing

Demo tracks are from **Pixabay Music** (Pixabay Content License). Playing commercial music publicly in restaurants requires a public-performance license — a business/legal decision for production use.

---

## 📄 License

**All rights reserved.** © 2026 Ahmad Al-Jamal.
No open-source license is granted. Ownership and usage rights of the code are subject to a separate written agreement, as stated in the assessment terms.
