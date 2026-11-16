# STM32 Firmware

Firmware for the STM32 microcontroller (built with STM32CubeIDE).

## Responsibilities
- Read inputs from connected sensors (Joystick, Light Sensor, and optional Gyro/IMU).
- Perform local signal processing (e.g., filtering, mapping, debouncing).
- Drive local actuators such as the speaker/buzzer.
- Communicate with the ESP32-S3 (e.g., via UART).

## Notes
- Execution model (bare-metal non-blocking loop or FreeRTOS) is TBD based on peripheral timing needs.
- Keep STM32CubeIDE workspace files (`.metadata/`) outside the repository.
- Keep custom application code separated from CubeMX-generated sections where possible to avoid merge conflicts.