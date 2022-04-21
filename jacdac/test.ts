basic.showIcon(IconNames.Happy)
forever(() => {
    led.toggle(0, 0)
    console.logValue("temp", modules.kitronikTemperature.temperature())
    console.logValue("pres", modules.kitronikPressure.pressure())
    console.logValue("humi", modules.kitronikHumidity.humidity())
    console.logValue("eco2", modules.kitronikCO2.eCO2())

    modules.kitronikDisplay.setLine(0, "milli:" + control.millis())
    modules.kitronikDisplay.setLine(1, "clock:" + modules.kitronikClock.hour() + ":" + modules.kitronikClock.min() + ":" + modules.kitronikClock.sec())
    modules.kitronikDisplay.setLine(
        2,
        "temp:" + modules.kitronikTemperature.temperature()
    )
    modules.kitronikDisplay.setLine(
        3,
        "pres:" + modules.kitronikPressure.pressure()
    )
    modules.kitronikDisplay.setLine(
        4,
        "humi:" + modules.kitronikHumidity.humidity()
    )
    modules.kitronikDisplay.setLine(5, "eco2:" + modules.kitronikCO2.eCO2())

    pause(1000)
})
