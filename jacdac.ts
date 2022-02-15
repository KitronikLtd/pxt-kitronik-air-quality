namespace kitronik_air_quality {
    function startJacdac() {
        if (!jacdac.isSimulator()) {
            bme688Init()
            pause(500)
            setupGasSensor()
            pause(500)
            // start all servers on hardware
            const servers: jacdac.SensorServer[] = [
                jacdac.createSimpleSensorServer(
                    "temperature",
                    jacdac.SRV_TEMPERATURE,
                    "i22.10",
                    () =>
                        readTemperature(
                            kitronik_air_quality.TemperatureUnitList.C
                        )
                ),
                jacdac.createSimpleSensorServer(
                    "pressure",
                    jacdac.SRV_BAROMETER,
                    "u22.10",
                    () =>
                        readPressure(kitronik_air_quality.PressureUnitList.Pa) /
                        100
                ),
                jacdac.createSimpleSensorServer(
                    "humidity",
                    jacdac.SRV_HUMIDITY,
                    "u22.10",
                    () => readHumidity()
                ),
                jacdac.createSimpleSensorServer(
                    "eCO2",
                    jacdac.SRV_E_CO2,
                    "u22.10",
                    () => readeCO2()
                ),
            ]
            for (const server of servers) server.start()
        }

        // in proxy mode, stop normal program execution
        // and entry proxy mode
        if (jacdac.checkProxy()) jacdac.proxyFinalize()
    }
    startJacdac()
}
