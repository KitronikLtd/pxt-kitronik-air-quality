namespace kitronik_air_quality {
    class CharacterScreenServer extends jacdac.Server {
        textDirection = jacdac.CharacterScreenTextDirection.LeftToRight
        message: string = ""

        constructor() {
            super("screen", jacdac.SRV_CHARACTER_SCREEN, {
                variant: jacdac.CharacterScreenVariant.OLED,
            })
        }

        handlePacket(pkt: jacdac.JDPacket): void {
            this.textDirection = this.handleRegValue(pkt, jacdac.CharacterScreenReg.TextDirection, "u8",this.textDirection)
            this.handleRegUInt32(pkt, jacdac.CharacterScreenReg.Columns, 26) // NUMBER_OF_CHAR_PER_LINE
            this.handleRegUInt32(pkt, jacdac.CharacterScreenReg.Rows, 8) // NUMBER_OF_CHAR_PER_LINE

            const oldMessage = this.message
            this.message = this.handleRegValue(pkt, jacdac.CharacterScreenReg.Message, "s", this.message);
            if (this.message != oldMessage)
                this.syncMessage();
        }

        private syncMessage() {
            if (!this.message)
                kitronik_air_quality.clear()
            else {
                const lines = this.message.split("\n")
                let i = 0;
                for (; i < lines.length; ++i)
                    kitronik_air_quality.show(lines[i], i + 1)
                for (; i < 8; ++i)
                    kitronik_air_quality.show("", i + 1)
            }
        }

    }

    function startJacdac() {
        if (!jacdac.isSimulator()) {
            bme688Init()
            setupGasSensor()
            // start all servers on hardware
            const servers: jacdac.Server[] = [
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
                /* does not work
                jacdac.createSimpleSensorServer(
                    "eCO2",
                    jacdac.SRV_E_CO2,
                    "u22.10",
                    () => readeCO2()
                ),
                */
                new CharacterScreenServer(),
            ]
            for (const server of servers) server.start()
        }

        // in proxy mode, stop normal program execution
        // and entry proxy mode
        if (jacdac.checkProxy()) jacdac.proxyFinalize()
    }
    startJacdac()
}
