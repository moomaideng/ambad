#include <Arduino.h>
#include <WebSocketsClient.h>
#include <WiFi.h>

#include "secrets.h"

WebSocketsClient ws;
bool wsConnected = false;
String line;
unsigned long lastPingMs = 0;

void onWsEvent(WStype_t type, uint8_t* payload, size_t len) {
    if (type == WStype_CONNECTED) {
        wsConnected = true;
        Serial.println("[WS] Connected");
    } else if (type == WStype_DISCONNECTED) {
        wsConnected = false;
        Serial.println("[WS] Disconnected");
    } else if (type == WStype_TEXT) {
        String msg(reinterpret_cast<char*>(payload), len);
        if (msg == "pong") return;
        Serial.printf("[WS RX] %s\n", msg.c_str());
        // Later: forward command to STM32 over Serial1
    }
}

void setup() {
    Serial.begin(115200);
    // Later: initialize Serial1 for STM32

    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED) delay(300);
    Serial.printf("WiFi OK: %s\n", WiFi.localIP().toString().c_str());

#if WS_USE_SSL
    ws.beginSSL(WS_HOST, WS_PORT, "/websocket?role=device");
#else
    ws.begin(WS_HOST, WS_PORT, "/websocket?role=device");
#endif
    ws.onEvent(onWsEvent);
    ws.setReconnectInterval(3000);
}

void loop() {
    ws.loop();

    // Read input from Serial Monitor (will switch to STM32 Serial1 later)
    while (Serial.available()) {
        char c = static_cast<char>(Serial.read());
        if (c == '\n') {
            line.trim();
            if (line.length() > 0 && wsConnected) {
                ws.sendTXT(line);
                Serial.printf("[TX] %s\n", line.c_str());
            }
            line = "";
        } else if (c != '\r') {
            line += c;
        }
    }

    if (wsConnected && millis() - lastPingMs >= 25000) {
        lastPingMs = millis();
        ws.sendTXT("ping");
    }
}