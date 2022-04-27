basic.showIcon(IconNames.Happy)
forever(() => {
    led.toggle(0, 0)
    console.logValue("temp", modules.kitronikTemperature.temperature())
    console.logValue("pres", modules.kitronikPressure.pressure())
    console.logValue("humi", modules.kitronikHumidity.humidity())
    console.logValue("eco2", modules.kitronikCO2.eCO2())

    modules.kitronikDisplay.setLineValue(0, "milli", control.millis())
    modules.kitronikDisplay.setLine(1, "clock:" + modules.kitronikClock.hour() + ":" + modules.kitronikClock.min() + ":" + modules.kitronikClock.sec())
    modules.kitronikDisplay.setLineValue(
        2,
        "temp", modules.kitronikTemperature.temperature()
    )
    modules.kitronikDisplay.setLineValue(
        3,
        "pres", modules.kitronikPressure.pressure()
    )
    modules.kitronikDisplay.setLineValue(
        4,
        "humi", modules.kitronikHumidity.humidity()
    )
    modules.kitronikDisplay.setLineValue(5, "eco2", modules.kitronikCO2.eCO2())

    led.toggle(1, 0)
    pause(1000)
})
