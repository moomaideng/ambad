# ESP32-S3 Wi-Fi Bridge

Firmware for the ESP32-S3 acting as the wireless bridge between the STM32 and the cloud.

## Responsibilities
- Receive sensor/input data from the STM32 and forward it over Wi-Fi to the cloud (e.g., NETPIE / MQTT).
- Listen for commands or feedback from the cloud/web client and relay them back to the STM32.

## Notes
- Framework (Arduino / ESP-IDF / PlatformIO) and concurrency approach are TBD.
- Ensure 3.3V logic and a common `GND` between the STM32 and ESP32-S3.
- Do not commit Wi-Fi credentials or API keys/tokens to Git.