forever(() => {
    console.logValue("temp", modules.kitronikTemperature.temperature())
    console.logValue("pres", modules.kitronikPressure.pressure())
    console.logValue("humi", modules.kitronikHumidity.humidity())

    modules.kitronikDisplay.setLine(0, "temp:" + modules.kitronikTemperature.temperature())
    modules.kitronikDisplay.setLine(1, "pres:" + modules.kitronikPressure.pressure())
    modules.kitronikDisplay.setLine(2, "humi:" + modules.kitronikHumidity.humidity())

    pause(1000)
})