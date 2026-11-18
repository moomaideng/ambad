# ESP32-S3 Wi-Fi Bridge

Firmware for the **ESP32-S3-N16R8** acting as the wireless WebSocket bridge between the STM32 and the Cloudflare Durable Object hub.

---

## Configuration Overview

- **Board:** `esp32-s3-devkitc-1` configured in `platformio.ini` for **N16R8** (`qio` 16 MB Flash, `opi` 8 MB PSRAM, `BOARD_HAS_PSRAM`)
- **Framework / Toolchain:** PlatformIO (`arduino` framework)
- **Library:** `links2004/WebSockets`

---

## Responsibilities & Current Status

- **Cloud WebSocket (`wss://` / `ws://`):** Connects to `/websocket?role=device` with automatic reconnect (`3s`) and a `25s` `"ping"` heartbeat (matching the Durable Object's `pong` auto-response).
- **Serial ↔ WebSocket Relay:**
  - *Current:* Reads newline-delimited test input from the USB `Serial` Monitor (`115200` bps) and prints incoming messages from the web client.
  - *Planned:* Relay sensor data and commands bidirectionally with the STM32 over `Serial1` (UART).

---

## Setup & Testing

1. Copy `include/secrets.h.example` to `include/secrets.h` *(gitignored)*.
2. Set `WIFI_SSID` and `WIFI_PASS` to a **2.4 GHz** Wi-Fi network *(ESP32-S3 does not support 5 GHz Wi-Fi)*.
3. Choose the WebSocket target in `include/secrets.h`:
   - **Cloudflare Workers (`WS_USE_SSL = 1`, `WS_PORT = 443`) — Recommended:**
     Point `WS_HOST` to either the **Production URL** (`ambad.<subdomain>.workers.dev`) or a **PR Preview URL** (`<branch>-ambad.<subdomain>.workers.dev`). This works from any Wi-Fi without firewall configuration.
   - **Local Dev (`WS_USE_SSL = 0`, `WS_PORT = 5173`):**
     Run `pnpm run dev -- --host` in `web-client/` and set `WS_HOST` to your laptop's LAN IP. Note that **Windows Firewall** or router client-isolation on home/dorm Wi-Fi may block the ESP32 from reaching port `5173` on your laptop — if blocked, switch to a Cloudflare Preview/Production URL instead.
4. Build and upload with PlatformIO, then open the Serial Monitor (`115200` bps).