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

    const YEAR_OFFSET = 2000
    class RealTimeClockServer extends jacdac.Server {
        constructor() {
            super("clock", jacdac.SRV_REAL_TIME_CLOCK, {
                variant: jacdac.RealTimeClockVariant.Crystal
            })
        }
        handlePacket(pkt: jacdac.JDPacket): void {
            if (pkt.isRegGet && pkt.regCode == jacdac.RealTimeClockReg.LocalTime) {
                const year = kitronik_air_quality.readDateParameter(DateParameter.Year)
                const month = kitronik_air_quality.readDateParameter(DateParameter.Month)
                const dayOfMonth = kitronik_air_quality.readDateParameter(DateParameter.Day)
                const dayOfWeek = 0
                const hour = kitronik_air_quality.readTimeParameter(TimeParameter.Hours)
                const min = kitronik_air_quality.readTimeParameter(TimeParameter.Minutes)
                const sec = kitronik_air_quality.readTimeParameter(TimeParameter.Seconds)
                this.handleRegFormat(pkt, jacdac.RealTimeClockReg.LocalTime, "u16 u8 u8 u8 u8 u8 u8", [year + YEAR_OFFSET, month, dayOfMonth, dayOfWeek, hour, min, sec])
            }
            else if (pkt.isCommand && pkt.serviceCommand == jacdac.RealTimeClockCmd.SetTime) {
                const [year, month, dayOfMonth, dayOfWeek, hour, min, sec] = pkt.jdunpack<[number, number, number, number, number, number, number]>("u16 u8 u8 u8 u8 u8 u8")
                kitronik_air_quality.setDate(dayOfMonth, month, year % YEAR_OFFSET)
                kitronik_air_quality.setTime(hour, min, sec)
                console.log(`${dayOfMonth}, ${month}, ${year}`)
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
                new RealTimeClockServer(),
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
