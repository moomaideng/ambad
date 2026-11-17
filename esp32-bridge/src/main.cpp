#include <Arduino.h>

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("ESP32-S3 N16R8 Ready!");
    Serial.printf("Flash: %d MB, PSRAM: %d KB\n",
                  ESP.getFlashChipSize() / (1024 * 1024),
                  ESP.getPsramSize() / 1024);
}

void loop() {
    Serial.println("Hello from ESP32-S3!");
    delay(2000);
}
