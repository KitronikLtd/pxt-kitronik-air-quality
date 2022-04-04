//% deprecated
namespace kitronik_air_quality {}

namespace servers {
    class CharacterScreenServer extends jacdac.Server {
        textDirection = jacdac.CharacterScreenTextDirection.LeftToRight
        message: string = ""

        constructor() {
            super("screen", jacdac.SRV_CHARACTER_SCREEN, {
                variant: jacdac.CharacterScreenVariant.OLED,
            })
        }

        handlePacket(pkt: jacdac.JDPacket): void {
            this.textDirection = this.handleRegValue(
                pkt,
                jacdac.CharacterScreenReg.TextDirection,
                "u8",
                this.textDirection
            )
            this.handleRegUInt32(pkt, jacdac.CharacterScreenReg.Columns, 26) // NUMBER_OF_CHAR_PER_LINE
            this.handleRegUInt32(pkt, jacdac.CharacterScreenReg.Rows, 8) // NUMBER_OF_CHAR_PER_LINE

            const oldMessage = this.message
            this.message = this.handleRegValue(
                pkt,
                jacdac.CharacterScreenReg.Message,
                "s",
                this.message
            )
            if (this.message != oldMessage) this.syncMessage()
        }

        private syncMessage() {
            if (!this.message) kitronik_air_quality.clear()
            else {
                const lines = this.message.split("\n")
                let i = 0
                for (; i < lines.length; ++i)
                    kitronik_air_quality.show(lines[i], i + 1)
                for (; i < 8; ++i) kitronik_air_quality.show("", i + 1)
            }
        }
    }

    const YEAR_OFFSET = 2000
    class RealTimeClockServer extends jacdac.SensorServer {
        constructor() {
            super("clock", jacdac.SRV_REAL_TIME_CLOCK, {
                variant: jacdac.RealTimeClockVariant.Crystal,
            })
        }

        serializeState() {
            const year = kitronik_air_quality.readDateParameter(
                DateParameter.Year
            )
            const month = kitronik_air_quality.readDateParameter(
                DateParameter.Month
            )
            const dayOfMonth = kitronik_air_quality.readDateParameter(
                DateParameter.Day
            )
            const dayOfWeek = 0
            const hour = kitronik_air_quality.readTimeParameter(
                TimeParameter.Hours
            )
            const min = kitronik_air_quality.readTimeParameter(
                TimeParameter.Minutes
            )
            const sec = kitronik_air_quality.readTimeParameter(
                TimeParameter.Seconds
            )
            return jacdac.jdpack("u16 u8 u8 u8 u8 u8 u8", [
                year + YEAR_OFFSET,
                month,
                dayOfMonth,
                dayOfWeek,
                hour,
                min,
                sec,
            ])
        }
        handleCustomCommand(pkt: jacdac.JDPacket): void {
            if (
                pkt.isCommand &&
                pkt.serviceCommand == jacdac.RealTimeClockCmd.SetTime
            ) {
                const [year, month, dayOfMonth, dayOfWeek, hour, min, sec] =
                    pkt.jdunpack<
                        [number, number, number, number, number, number, number]
                    >("u16 u8 u8 u8 u8 u8 u8")
                kitronik_air_quality.setDate(
                    dayOfMonth,
                    month,
                    year % YEAR_OFFSET
                )
                kitronik_air_quality.setTime(hour, min, sec)
                console.log(`${dayOfMonth}, ${month}, ${year}`)
            } else pkt.possiblyNotImplemented()
        }
    }

    function startJacdac() {
        if (!jacdac.isSimulator()) {
            kitronik_air_quality.bme688Init()
            kitronik_air_quality.setupGasSensor()
            const STREAMING_INTERVAL = 1000
            forever(() => {
                kitronik_air_quality.measureData()
                pause(STREAMING_INTERVAL)
            })
            // start all servers on hardware
            const servers: jacdac.Server[] = [
                jacdac.createSimpleSensorServer(
                    "temperature",
                    jacdac.SRV_TEMPERATURE,
                    "i22.10",
                    () => {
                        led.toggle(0, 0)
                        return kitronik_air_quality.readTemperature(
                            kitronik_air_quality.TemperatureUnitList.C
                        )
                    },
                    {
                        streamingInterval: STREAMING_INTERVAL,
                    }
                ),
                jacdac.createSimpleSensorServer(
                    "pressure",
                    jacdac.SRV_AIR_PRESSURE,
                    "u22.10",
                    () =>
                        kitronik_air_quality.readPressure(
                            kitronik_air_quality.PressureUnitList.Pa
                        ) / 100,
                    {
                        streamingInterval: STREAMING_INTERVAL,
                    }
                ),
                jacdac.createSimpleSensorServer(
                    "humidity",
                    jacdac.SRV_HUMIDITY,
                    "u22.10",
                    () => kitronik_air_quality.readHumidity(),
                    {
                        streamingInterval: STREAMING_INTERVAL,
                    }
                ),
                jacdac.createSimpleSensorServer(
                    "eCO2",
                    jacdac.SRV_E_CO2,
                    "u22.10",
                    () => kitronik_air_quality.readeCO2(),
                    {
                        streamingInterval: STREAMING_INTERVAL,
                        calibrate: () => kitronik_air_quality.calcBaselines(),
                    }
                ),
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

namespace modules {
    /**
     * The air temperature sensor on the Kitronik air quality module
     */
    //% fixedInstance whenUsed block="kitronik temperature"
    export const kitronikTemperature = new TemperatureClient(
        "kitronik temperature?device=self"
    )

    /**
     * The air pressure sensor on the Kitronik air quality module
     */
    //% fixedInstance whenUsed block="kitronik pressure"
    export const kitronikPressure = new AirPressureClient(
        "kitronik pressure?device=self"
    )

    /**
     * The air humidity sensor on the Kitronik air quality module
     */
    //% fixedInstance whenUsed block="kitronik air humidity"
    export const kitronikHumidity = new HumidityClient(
        "kitronik humidity?device=self"
    )

    /**
     * The CO2 sensor on the Kitronik air quality module
     */
    //% fixedInstance whenUsed block="kitronik CO2"
    export const kitronikCO2 = new ECO2Client("kitronik CO2?device=self")

    /**
     * The character screen display on the Kitronik air quality module
     */
    //% fixedInstance whenUsed block="kitronik air CO2"
    export const kitronikDisplay = new CharacterScreenClient(
        "kitronik display?device=self"
    )

    /**
     * The real time clock client on the Kitronik air quality module
     */
    //% fixedInstance whenUsed block="kitronik clock"
    export const kitronikClock = new RealTimeClockClient(
        "kitronik clock?device=self"
    )
}
